import { ContentHost } from '../interfaces/ContentHost';
import { Properties } from '../interfaces/Properties';
import { Cleanup, Cleanups } from './reactive';

/**
 * The common base of everything JSX produces: a real DOM element plus the tree of
 * components and cleanups that has to be released together with it.
 *
 * Destroying a component disposes its effects, destroys its children and removes its
 * element from the DOM.
 */
export abstract class BaseComponent<P extends Properties = Properties> implements ContentHost {
  /**
   * The real DOM element of the component. Set while the component renders.
   */
  public element!: Element | HTMLElement;

  /**
   * Components rendered inside this one, destroyed together with it.
   */
  public children: BaseComponent[] = [];

  public destroyed = false;

  /**
   * Cleanups of effects created while this component rendered.
   */
  private cleanups = new Cleanups();

  constructor(public properties: P = {} as P) {
  }

  own(dispose: Cleanup) {
    this.cleanups.own(dispose);
  }

  adopt(child: BaseComponent) {
    this.children.push(child);
  }

  /**
   * Releases the component. Safe to call more than once.
   */
  destroy() {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;

    // Effects go first, so nothing reacts to the teardown that follows.
    this.cleanups.run();
    this.destroyChildren();
    this.removeElement();
  }

  private destroyChildren() {
    this.children.forEach(child => child.destroy());
  }

  private removeElement() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
