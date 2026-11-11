import { BaseComponent } from './BaseComponent';
import { Properties } from '../interfaces/Properties';
import { ContentRenderer, defaultContentRenderer } from './content/ContentRenderer';
import { documentNodeFactory, NodeFactory } from './dom/NodeFactory';
import { defaultPropertyBinder, PropertyBinder } from './dom/PropertyBinder';
import { runInScope } from './reactive';

/**
 * The collaborators an element component renders with.
 */
export interface ElementDependencies {
  /**
   * Creates the element.
   */
  nodes: NodeFactory;

  /**
   * Connects the JSX attributes to the element.
   */
  properties: PropertyBinder;

  /**
   * Renders the JSX children into the element.
   */
  content: ContentRenderer;
}

export const defaultElementDependencies: ElementDependencies = {
  nodes: documentNodeFactory,
  properties: defaultPropertyBinder,
  content: defaultContentRenderer,
};

/**
 * A component for a lowercase JSX tag (`<div/>`, `<svg/>`, ...): it creates the DOM element,
 * binds its properties and renders its children right in the constructor.
 */
export class ElementComponent extends BaseComponent {
  /**
   * @param elementName the tag name.
   * @param properties the JSX attributes.
   * @param content the JSX children.
   * @param dependencies what the element is rendered with; the defaults render into `document`.
   */
  constructor(
    public elementName: string,
    properties?: Properties | null,
    content?: any,
    private dependencies: ElementDependencies = defaultElementDependencies,
  ) {
    super(properties || {});

    // Reactive properties and children create effects; they belong to this component.
    runInScope(this, () => this.mount(content));
  }

  private mount(content: any) {
    const {nodes, properties, content: renderer} = this.dependencies;

    this.element = nodes.element(this.elementName);
    properties.bind(this.element, this.properties);
    renderer.append(this.element, this, content);

    // `ref` comes last, so it sees the element with its children appended.
    if (typeof this.properties.ref === 'function') {
      this.properties.ref(this.element);
    }
  }
}
