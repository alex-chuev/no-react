import { Properties } from '../../interfaces/Properties';
import { BaseComponent } from '../BaseComponent';

/**
 * Creates components for the element types it `matches`.
 *
 * `createElement` asks its factories in order, so a new kind of JSX element type
 * is supported by adding a factory, without changing `createElement`.
 */
export interface ComponentFactory {
  /**
   * Whether this factory can create a component for `type` (the JSX tag).
   */
  matches(type: any): boolean;

  /**
   * Creates the component, fully rendered.
   *
   * @param type the JSX tag: a tag name, a class or a function.
   * @param properties the JSX attributes, never `null`.
   * @param content the JSX children.
   */
  create(type: any, properties: Properties, content: any[]): BaseComponent;
}
