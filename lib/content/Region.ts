import { BaseComponent } from '../BaseComponent';
import { NodeFactory } from '../dom/NodeFactory';
import { ContentVisitor, isRenderable, visitContent } from './visitContent';

/**
 * What a region currently shows: its top-level DOM nodes, in order, and the components
 * among them, which the region owns.
 */
interface Rendered {
  nodes: Node[];
  components: BaseComponent[];
}

/**
 * A run of nodes inside `parent`, ending at a marker, that is replaced in place on every update.
 *
 * A region is what a reactive child (`{() => ...}`) renders into. It has no wrapper element:
 * its nodes sit directly among their siblings, and an empty comment marks where the region
 * ends so it can be updated without touching the rest of the parent.
 *
 * Updates are reconciled by identity. Nodes and components present in both the old and the new
 * value are kept (and only moved if needed), the rest are destroyed or removed. That is what
 * lets `each` preserve the DOM of list items whose keys survive.
 */
export class Region {
  private end: Comment;
  private current: Rendered = {nodes: [], components: []};

  constructor(private parent: Node, private nodes: NodeFactory) {
    this.end = nodes.marker();
    parent.appendChild(this.end);
  }

  /**
   * Replaces what the region shows with `value`.
   */
  update(value: any) {
    if (this.updateText(value)) {
      return;
    }

    const next = this.collect(value);

    this.destroyDropped(next);
    this.removeDropped(next);
    this.insert(next);

    this.current = next;
  }

  /**
   * Destroys the components the region shows. Called when the owning component is destroyed;
   * the nodes themselves leave the DOM together with the parent.
   */
  destroy() {
    this.current.components.forEach(component => component.destroy());
  }

  /**
   * Fast path: a region that keeps rendering a single primitive just updates its text node.
   */
  private updateText(value: any) {
    const {nodes} = this.current;
    const [node] = nodes;

    if (nodes.length === 1 && node instanceof Text && isRenderable(value) && typeof value !== 'object' && typeof value !== 'function') {
      node.data = String(value);
      return true;
    }

    return false;
  }

  /**
   * Flattens `value` into the nodes and components to show.
   * Nested functions are called right away, so the signals they read are tracked by this region.
   */
  private collect(value: any): Rendered {
    const into: Rendered = {nodes: [], components: []};

    const collector: ContentVisitor = {
      component: component => {
        into.nodes.push(component.element);
        into.components.push(component);
      },
      node: node => into.nodes.push(node),
      text: data => into.nodes.push(this.nodes.text(data)),
      dynamic: fn => visitContent(fn(), collector),
    };

    visitContent(value, collector);

    return into;
  }

  /**
   * Destroys the components that are not part of the next value.
   */
  private destroyDropped(next: Rendered) {
    const kept = new Set(next.components);

    this.current.components
      .filter(component => !kept.has(component))
      .forEach(component => component.destroy());
  }

  /**
   * Removes from the DOM the nodes that are not part of the next value.
   * Destroyed components have usually removed their element already, hence the `parentNode` check.
   */
  private removeDropped(next: Rendered) {
    const kept = new Set(next.nodes);

    this.current.nodes
      .filter(node => !kept.has(node) && node.parentNode)
      .forEach(node => node.parentNode!.removeChild(node));
  }

  /**
   * Puts the next nodes in order before the end marker.
   *
   * Walking backwards from the marker, each node only has to sit right before the one after it,
   * so nodes that are already in place are not moved at all.
   */
  private insert(next: Rendered) {
    let ref: Node = this.end;

    for (let i = next.nodes.length - 1; i >= 0; i--) {
      const node = next.nodes[i];

      if (node.nextSibling !== ref) {
        this.parent.insertBefore(node, ref);
      }

      ref = node;
    }
  }
}
