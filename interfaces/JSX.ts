import { BaseComponent } from '../lib/BaseComponent';

export namespace JSX {
  export type Element = BaseComponent;

  export type ElementClass = BaseComponent;

  export interface ElementAttributesProperty {
    properties: {};
  }

  // Children reach components as the `content` argument, so any component accepts them.
  export type LibraryManagedAttributes<C, P> = P & { children?: any };

  export interface IntrinsicElements {
    [tagName: string]: { [name: string]: any };
  }
}
