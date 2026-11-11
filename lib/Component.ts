import { Properties } from '../interfaces/Properties';
import { BaseComponent } from './BaseComponent';
import { CompositeComponent } from './CompositeComponent';
import { runInScope } from './reactive';

/**
 * The base class of class components.
 *
 * Subclasses implement `render` and may override the lifecycle hooks. Signals kept in
 * class fields hold the component state; `render` runs once, and only what is bound to
 * those signals updates afterwards.
 */
export abstract class Component<P extends Properties = Properties> extends CompositeComponent<P> {
  /**
   * @param properties the JSX attributes of the component.
   * @param content the JSX children of the component.
   */
  constructor(properties?: P, public content: any[] = []) {
    super(properties || {} as P);
  }

  /**
   * Called by `createElement` once the instance is fully constructed,
   * so class fields are already initialized when `render` runs.
   */
  renderComponent(content: any[] = this.content) {
    // Effects created by the hooks and by `render` belong to this component.
    runInScope(this, () => {
      this.beforeRender();

      this.appendChildComponent(this.render(content));

      this.afterRender();
    });
  }

  /**
   * Runs right before `render`.
   */
  beforeRender() {
  }

  /**
   * Runs right after `render`, when `element` is available.
   */
  afterRender() {
  }

  /**
   * Returns the root of the component, usually a JSX expression.
   *
   * @param content the JSX children of the component.
   */
  abstract render(content: any[]): BaseComponent;

  /**
   * Makes `child` the root of the component.
   */
  appendChildComponent(child: BaseComponent) {
    this.adoptRoot(child);
  }

  /**
   * Releases the component, calling the destroy hooks around it. Safe to call more than once.
   */
  destroy() {
    if (this.destroyed) {
      return;
    }

    this.beforeDestroy();
    super.destroy();
    this.afterDestroy();
  }

  /**
   * Runs before the component is released, while its element is still in the DOM.
   */
  beforeDestroy() {
  }

  /**
   * Runs after the component is released and its element is removed.
   */
  afterDestroy() {
  }
}
