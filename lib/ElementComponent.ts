import { BaseComponent } from './BaseComponent';
import { Properties } from '../interfaces/Properties';

export class ElementComponent extends BaseComponent {
  constructor(public elementName: string, properties?: Properties, content?: any) {
    super(properties);

    this.render(content);
  }

  render(content) {
    this.createElement();
    this.setAttributes();
    this.renderContent(content);
  }

  private createElement() {
    this.element = document.createElement(this.elementName);
  }

  private setAttributes() {
    Object.keys(this.properties)
      .forEach(key => this.element[key] = this.properties[key]);
  }

  private renderContent(content: any) {
    if (Array.isArray(content)) {
      content.forEach(this.renderContent, this);
    } else if (content instanceof BaseComponent) {
      this.appendChildComponent(content);
    } else {
      this.element.appendChild(document.createTextNode(content));
    }
  }

  private appendChildComponent(child: BaseComponent) {
    this.element.appendChild(child.element);
    this.children.push(child);
  }
}
