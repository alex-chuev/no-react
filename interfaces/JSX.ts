import { BaseComponent } from '../lib/BaseComponent';

/**
 * Types TypeScript uses to check JSX written against this library.
 */
export namespace JSX {
  /**
   * The type of every JSX expression: a component holding a real DOM element.
   */
  export type Element = BaseComponent;

  /**
   * What class components must extend to be usable in JSX.
   */
  export type ElementClass = BaseComponent;

  /**
   * Tells TypeScript to type-check JSX attributes against the `properties` of a class component.
   */
  export interface ElementAttributesProperty {
    properties: {};
  }

  // Children reach components as the `content` argument, so any component accepts them.
  export type LibraryManagedAttributes<C, P> = P & { children?: any };

  /**
   * Any lowercase tag is a DOM element and accepts any attribute.
   */
  export interface IntrinsicElements {
    [tagName: string]: { [name: string]: any };
  }
}
