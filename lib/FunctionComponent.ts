import { Properties } from '../interfaces/Properties';
import { BaseComponent } from './BaseComponent';
import { CompositeComponent } from './CompositeComponent';
import { runInScope } from './reactive';

/**
 * A component written as a function: it receives the JSX attributes and children
 * and returns the root of the component. It runs once.
 */
export type FunctionalComponent<P extends Properties = Properties> = (properties: P, content: any[]) => BaseComponent;

/**
 * Wraps a function component, so it is owned and destroyed like any other component.
 */
export class FunctionComponent<P extends Properties = Properties> extends CompositeComponent<P> {
  constructor(public fn: FunctionalComponent<P>, properties: P, content: any[]) {
    super(properties);

    // Effects and `onCleanup` calls inside the function belong to this component.
    runInScope(this, () => this.adoptRoot(fn(properties, content)));
  }
}
