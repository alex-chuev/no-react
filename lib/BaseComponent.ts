import { Properties } from '../interfaces/Properties';
import { Cleanup, Owner } from './reactive';

export abstract class BaseComponent<P extends Properties = Properties> implements Owner {
  public element!: Element | HTMLElement;
  public children: BaseComponent[] = [];
  public destroyed = false;
  private disposers: Cleanup[] = [];

  constructor(public properties: P = {} as P) {
  }

  own(dispose: Cleanup) {
    this.disposers.push(dispose);
  }

  destroy() {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.dispose();
    this.destroyChildren();
    this.removeElement();
  }

  private dispose() {
    const disposers = this.disposers;
    this.disposers = [];
    disposers.forEach(dispose => dispose());
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
