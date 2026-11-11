import { Properties } from '../../interfaces/Properties';
import { effect } from '../reactive';
import { defaultPropertyWriter, PropertyWriter } from './PropertyWriter';

/**
 * Writes a new value of the property being bound to the element.
 */
export type Write = (value: any) => void;

/**
 * Decides how a property is connected to an element: once, reactively, as a listener, or not at all.
 *
 * A binding decides *when* a value is written; a `PropertyWriter` decides *how*. Keeping them apart
 * lets, for example, a reactive `className` reuse the same writer as a static one.
 */
export interface PropertyBinding {
  /**
   * Whether this binding is responsible for the property.
   */
  matches(key: string, value: any): boolean;

  /**
   * Connects the property to `element`, calling `write` with each value to apply.
   */
  bind(element: Element, key: string, value: any, write: Write): void;
}

/**
 * `key` (used by lists) and `ref` (called by the element component after rendering)
 * are not written to the element.
 */
export const reservedBinding: PropertyBinding = {
  matches: key => key === 'key' || key === 'ref',
  bind: () => {
  },
};

/**
 * `onClick={fn}` and the lowercase `onclick={fn}`: attaches `fn` as an event listener.
 * The event name is the rest of the key, lowercased.
 */
export const eventBinding: PropertyBinding = {
  matches: (key, value) => key.startsWith('on') && typeof value === 'function',
  bind: (element, key, listener) => element.addEventListener(key.slice(2).toLowerCase(), listener),
};

/**
 * Any other function, a signal included: writes its result now and again whenever the
 * signals it reads change. The effect is owned by the element component being rendered.
 */
export const reactiveBinding: PropertyBinding = {
  matches: (key, value) => typeof value === 'function',
  bind: (element, key, read, write) => {
    effect(() => write(read()));
  },
};

/**
 * Plain values: written once.
 */
export const staticBinding: PropertyBinding = {
  matches: () => true,
  bind: (element, key, value, write) => write(value),
};

/**
 * Connects all properties of an element, handing each to the first binding that matches it
 * and writing values through `writer`.
 */
export class PropertyBinder {
  constructor(private bindings: PropertyBinding[], private writer: PropertyWriter) {
  }

  /**
   * Binds every property of `properties` to `element`.
   */
  bind(element: Element, properties: Properties) {
    Object.keys(properties)
      .forEach(key => this.bindProperty(element, key, properties[key]));
  }

  private bindProperty(element: Element, key: string, value: any) {
    this.bindings
      .find(binding => binding.matches(key, value))
      ?.bind(element, key, value, next => this.writer.write(element, key, next));
  }
}

/**
 * The binder used by default. The order matters: reserved keys first, then listeners
 * (which are functions too) before reactive values, and static values last.
 */
export const defaultPropertyBinder = new PropertyBinder(
  [reservedBinding, eventBinding, reactiveBinding, staticBinding],
  defaultPropertyWriter,
);
