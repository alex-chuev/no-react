import { BaseComponent } from './BaseComponent';
import { ComponentFactory } from './factories/ComponentFactory';
import { defaultFactories } from './factories/defaultFactories';
import { Properties } from '../interfaces/Properties';

export type { ComponentClass } from './factories/defaultFactories';

/**
 * The JSX factory signature: `createElement(type, properties, ...children)`.
 */
export type CreateElement = (element: any, properties?: Properties | null, ...content: any[]) => BaseComponent;

/**
 * Builds a `createElement` that hands each element type to the first factory that matches it.
 *
 * @throws TypeError when no factory matches the element type.
 */
export function createElementWith(factories: ComponentFactory[]): CreateElement {
  return (element, properties, ...content) => {
    const factory = factories.find(candidate => candidate.matches(element));

    if (!factory) {
      throw new TypeError(`Unsupported element type: ${String(element)}`);
    }

    // The classic JSX transform passes `null` when an element has no attributes.
    return factory.create(element, properties || {}, content);
  };
}

/**
 * Creates a component for a tag name, a class component or a function component.
 * This is what JSX compiles to, and it can be called directly to build UI without JSX.
 */
export const createElement = createElementWith(defaultFactories);
