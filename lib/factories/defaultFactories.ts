import { Properties } from '../../interfaces/Properties';
import { Component } from '../Component';
import { ElementComponent } from '../ElementComponent';
import { FunctionalComponent, FunctionComponent } from '../FunctionComponent';
import { untrack } from '../reactive';
import { ComponentFactory } from './ComponentFactory';

/**
 * A class component constructor, as used in JSX.
 */
export type ComponentClass<P extends Properties = Properties> = new (properties: P, content: any[]) => Component<P>;

/**
 * `<div/>`: a DOM element.
 */
export const elementFactory: ComponentFactory = {
  matches: type => typeof type === 'string',
  create: (tagName: string, properties, content) => new ElementComponent(tagName, properties, content),
};

/**
 * `<Counter/>` where `Counter extends Component`.
 *
 * The component is constructed first and rendered afterwards, so class fields are initialized
 * when `render` runs. Rendering is untracked: a component created inside an effect must not
 * make that effect depend on the signals the component reads while rendering.
 */
export const classFactory: ComponentFactory = {
  matches: type => typeof type === 'function' && type.prototype instanceof Component,
  create: (type: ComponentClass, properties, content) => untrack(() => {
    const component = new type(properties, content);
    component.renderComponent(content);

    return component;
  }),
};

/**
 * `<Content/>` where `Content` is a function. Matches any function, so it must come after
 * `classFactory`. Untracked for the same reason as class components.
 */
export const functionFactory: ComponentFactory = {
  matches: type => typeof type === 'function',
  create: (fn: FunctionalComponent, properties, content) => untrack(() => new FunctionComponent(fn, properties, content)),
};

/**
 * The factories used by default, from the most specific to the catch-all.
 */
export const defaultFactories: ComponentFactory[] = [elementFactory, classFactory, functionFactory];
