import { isSvgElement } from './svg';

/**
 * Writes a property value to an element, if it `matches` that property.
 *
 * Each writer handles one way of putting a value on an element (a style, a class, an attribute,
 * a DOM property). They are tried in order by `PropertyWriterChain`, so a new kind of property
 * is supported by adding a writer, not by changing existing ones.
 */
export interface PropertyWriter {
  /**
   * Whether this writer is responsible for `key` on `element`.
   */
  matches(element: Element, key: string, value: any): boolean;

  /**
   * Puts `value` on `element`. Called on the first render and on every reactive update.
   */
  write(element: Element, key: string, value: any): void;
}

/**
 * Turns a value into DOM text, treating `null` and `undefined` as empty.
 */
const toText = (value: any) => value == null ? '' : String(value);

/**
 * `style={{color: 'red', 'margin-top': '2px'}}`: replaces the whole inline style.
 * camelCase names are set as style properties, dashed names (including custom
 * properties like `--gap`) with `setProperty`.
 */
export const styleObjectWriter: PropertyWriter = {
  matches: (element, key, value) => key === 'style' && !!value && typeof value === 'object',
  write: (element, key, style: { [name: string]: any }) => {
    const {style: declaration} = element as HTMLElement;

    // Start from scratch, so names missing from a new object are removed.
    declaration.cssText = '';

    Object.keys(style).forEach(name => {
      if (name.includes('-')) {
        declaration.setProperty(name, toText(style[name]));
      } else {
        (declaration as any)[name] = toText(style[name]);
      }
    });
  },
};

/**
 * `style="color: blue"`: sets the inline style as CSS text.
 */
export const styleTextWriter: PropertyWriter = {
  matches: (element, key) => key === 'style',
  write: (element, key, value) => (element as HTMLElement).style.cssText = toText(value),
};

/**
 * `class` and `className` on HTML elements: sets the `className` property.
 * SVG elements fall through to `attributeWriter`.
 */
export const classNameWriter: PropertyWriter = {
  matches: (element, key) => (key === 'class' || key === 'className') && !isSvgElement(element),
  write: (element, key, value) => element.className = toText(value),
};

/**
 * Anything that is not a DOM property (`data-*`, `aria-*`, custom attributes) and every
 * property of an SVG element: sets an attribute. `true` sets an empty attribute,
 * `null`, `undefined` and `false` remove it.
 */
export const attributeWriter: PropertyWriter = {
  matches: (element, key) => isSvgElement(element) || !(key in element),
  write: (element, key, value) => {
    const name = key === 'className' ? 'class' : key;

    if (value == null || value === false) {
      element.removeAttribute(name);
    } else {
      element.setAttribute(name, value === true ? '' : String(value));
    }
  },
};

/**
 * DOM properties (`value`, `checked`, `disabled`, ...): assigns the property directly.
 * Matches everything, so it must come last.
 */
export const domPropertyWriter: PropertyWriter = {
  matches: () => true,
  // `null` would turn into the text "null" in string properties like `value`, so it clears them instead.
  write: (element: any, key, value) => element[key] = value == null && typeof element[key] === 'string' ? '' : value,
};

/**
 * Delegates to the first of its writers that matches the property.
 * It is a writer itself, so chains can be nested.
 */
export class PropertyWriterChain implements PropertyWriter {
  constructor(private writers: PropertyWriter[]) {
  }

  matches(element: Element, key: string, value: any) {
    return this.writers.some(writer => writer.matches(element, key, value));
  }

  write(element: Element, key: string, value: any) {
    this.writers
      .find(writer => writer.matches(element, key, value))
      ?.write(element, key, value);
  }
}

/**
 * The writers used by default, from the most specific to the catch-all.
 */
export const defaultPropertyWriter = new PropertyWriterChain([
  styleObjectWriter,
  styleTextWriter,
  classNameWriter,
  attributeWriter,
  domPropertyWriter,
]);
