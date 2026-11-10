import { Properties } from '../interfaces/Properties';
import { BaseComponent } from './BaseComponent';
import { runInScope } from './reactive';

export abstract class Component<P extends Properties = Properties> extends BaseComponent<P> {
  constructor(properties?: P, public content: any[] = []) {
    super(properties || {} as P);
  }

  /**
   * Called by `createElement` once the instance is fully constructed,
   * so class fields are already initialized when `render` runs.
   */
  renderComponent(content: any[] = this.content) {
    runInScope(this, () => {
      this.beforeRender();

      this.appendChildComponent(this.render(content));

      this.afterRender();
    });
  }

  beforeRender() {
  }

  afterRender() {
  }

  abstract render(content: any[]): BaseComponent;

  appendChildComponent(child: BaseComponent) {
    this.element = child.element;
    this.children.push(child);
  }

  destroy() {
    if (this.destroyed) {
      return;
    }

    this.beforeDestroy();
    super.destroy();
    this.afterDestroy();
  }

  beforeDestroy() {
  }

  afterDestroy() {
  }
}
