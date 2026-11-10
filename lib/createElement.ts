import { BaseComponent } from './BaseComponent';
import { Component } from './Component';
import { ElementComponent } from './ElementComponent';
import { FunctionalComponent, FunctionComponent } from './FunctionComponent';
import { Properties } from '../interfaces/Properties';
import { untrack } from './reactive';

export type ComponentClass<P extends Properties = Properties> = new (properties: P, content: any[]) => Component<P>;

export function createElement(element: any, properties?: Properties | null, ...content: any[]): BaseComponent {
  if (typeof element === 'string') {
    return new ElementComponent(element, properties, content);
  }

  return untrack(() => {
    if (element.prototype instanceof Component) {
      const component: Component = new (element as ComponentClass)(properties || {}, content);
      component.renderComponent(content);

      return component;
    }

    return new FunctionComponent(element as FunctionalComponent, properties || {}, content);
  });
}
