import { BaseComponent } from './BaseComponent';
import { Properties } from '../interfaces/Properties';
import { appendContent } from './content';
import { effect, runInScope } from './reactive';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

// Tags shared with HTML (a, title, style, script) are left out and stay HTML elements.
const SVG_TAGS = new Set([
  'svg', 'g', 'defs', 'symbol', 'use', 'path', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'rect',
  'text', 'tspan', 'textPath', 'clipPath', 'mask', 'pattern', 'marker', 'linearGradient', 'radialGradient',
  'stop', 'filter', 'image', 'foreignObject',
]);

export class ElementComponent extends BaseComponent {
  constructor(public elementName: string, properties?: Properties | null, content?: any) {
    super(properties || {});

    runInScope(this, () => this.render(content));
  }

  render(content: any) {
    this.createElement();
    this.setAttributes();
    appendContent(this.element, this, content);

    if (typeof this.properties.ref === 'function') {
      this.properties.ref(this.element);
    }
  }

  private get isSvg() {
    return this.element.namespaceURI === SVG_NAMESPACE;
  }

  private createElement() {
    this.element = SVG_TAGS.has(this.elementName)
      ? document.createElementNS(SVG_NAMESPACE, this.elementName)
      : document.createElement(this.elementName);
  }

  private setAttributes() {
    Object.keys(this.properties)
      .forEach(key => this.setProperty(key, this.properties[key]));
  }

  private setProperty(key: string, value: any) {
    if (key === 'key' || key === 'ref') {
      return;
    }

    if (key.startsWith('on') && typeof value === 'function') {
      this.element.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (typeof value === 'function') {
      effect(() => this.applyProperty(key, value()));
    } else {
      this.applyProperty(key, value);
    }
  }

  private applyProperty(key: string, value: any) {
    const element = this.element as any;

    if (key === 'style' && value && typeof value === 'object') {
      this.applyStyle(value);
    } else if (key === 'style') {
      element.style.cssText = value == null ? '' : value;
    } else if ((key === 'class' || key === 'className') && !this.isSvg) {
      element.className = value == null ? '' : value;
    } else if (this.isSvg || !(key in element)) {
      this.applyAttribute(key === 'className' ? 'class' : key, value);
    } else {
      element[key] = value == null && typeof element[key] === 'string' ? '' : value;
    }
  }

  private applyAttribute(name: string, value: any) {
    if (value == null || value === false) {
      this.element.removeAttribute(name);
    } else {
      this.element.setAttribute(name, value === true ? '' : String(value));
    }
  }

  private applyStyle(style: { [name: string]: any }) {
    const element = this.element as HTMLElement;
    element.style.cssText = '';

    Object.keys(style).forEach(name => {
      const value = style[name] == null ? '' : String(style[name]);

      if (name.includes('-')) {
        element.style.setProperty(name, value);
      } else {
        (element.style as any)[name] = value;
      }
    });
  }
}
