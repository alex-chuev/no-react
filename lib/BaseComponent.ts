import { Properties } from '../interfaces/Properties';

export abstract class BaseComponent {
  public element: Element|HTMLElement;
  public children: BaseComponent[] = [];

  constructor(public properties?: Properties) {
  }

  destroy() {
    this.destroyChildren();
    this.removeElement();
  }

  private destroyChildren() {
    this.children.forEach(child => child.destroy());
  }

  private removeElement() {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
