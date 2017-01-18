import { Properties } from '../interfaces/Properties';
import { BaseComponent } from './BaseComponent';

export abstract class Component extends BaseComponent {
  constructor(properties?: Properties, content?: any) {
    super(properties);

    this.renderComponent(content);
  }

  renderComponent(content: any) {
    this.beforeRender();

    this.appendChildComponent(this.render(content));

    this.afterRender();
  }

  beforeRender() {
  }

  afterRender() {
  }

  abstract render(content?: any): BaseComponent;

  appendChildComponent(child: BaseComponent) {
    this.element = child.element;
    this.children.push(child);
  }

  destroy() {
    this.beforeDestroy();
    super.destroy();
    this.afterDestroy();
  }

  beforeDestroy() {
  }

  afterDestroy() {
  }
}
