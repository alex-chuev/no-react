import { Properties } from '../interfaces/Properties';
import { BaseComponent } from './BaseComponent';
import { runInScope } from './reactive';

export type FunctionalComponent<P extends Properties = Properties> = (properties: P, content: any[]) => BaseComponent;

export class FunctionComponent<P extends Properties = Properties> extends BaseComponent<P> {
  constructor(public fn: FunctionalComponent<P>, properties: P, content: any[]) {
    super(properties);

    runInScope(this, () => {
      const child = fn(properties, content);
      this.element = child.element;
      this.children.push(child);
    });
  }
}
