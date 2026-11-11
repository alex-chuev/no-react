import { ContentHost } from '../../interfaces/ContentHost';
import { documentNodeFactory, NodeFactory } from '../dom/NodeFactory';
import { effect } from '../reactive';
import { Region } from './Region';
import { visitContent } from './visitContent';

/**
 * Renders the children of an element.
 */
export class ContentRenderer {
  constructor(private nodes: NodeFactory) {
  }

  /**
   * Appends static content to `parent`. Functions become reactive regions
   * that re-render in place whenever the signals they read change.
   *
   * Components found in the content are adopted by `host`, so they are destroyed with it.
   */
  append(parent: Node, host: ContentHost, content: any) {
    visitContent(content, {
      component: component => {
        parent.appendChild(component.element);
        host.adopt(component);
      },
      node: node => parent.appendChild(node),
      text: data => parent.appendChild(this.nodes.text(data)),
      dynamic: fn => this.appendRegion(parent, host, fn),
    });
  }

  /**
   * Creates a region for `fn` and keeps it in sync with an effect.
   * Both the effect (created while `host` is the current owner) and the region's components
   * are released when `host` is destroyed.
   */
  private appendRegion(parent: Node, host: ContentHost, fn: () => any) {
    const region = new Region(parent, this.nodes);

    effect(() => region.update(fn()));
    host.own(() => region.destroy());
  }
}

/**
 * The renderer used by default, creating nodes in the global `document`.
 */
export const defaultContentRenderer = new ContentRenderer(documentNodeFactory);
