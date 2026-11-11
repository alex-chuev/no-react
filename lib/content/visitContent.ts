import { BaseComponent } from '../BaseComponent';

/**
 * Receives each item found by `visitContent`, already sorted by kind.
 */
export interface ContentVisitor {
  /**
   * A component: its element is rendered and the component must be owned by someone.
   */
  component(component: BaseComponent): void;

  /**
   * A native DOM node passed as content, rendered as is.
   */
  node(node: Node): void;

  /**
   * A string, number or bigint, already converted to text.
   */
  text(data: string): void;

  /**
   * A function (a signal included): reactive content whose value can change over time.
   */
  dynamic(fn: () => any): void;
}

/**
 * Whether a value produces output. `null`, `undefined` and booleans render nothing,
 * which makes `{condition && <Item/>}` work.
 */
export function isRenderable(content: any) {
  return content != null && typeof content !== 'boolean';
}

/**
 * Walks (possibly nested) content, telling `visitor` what kind each item is.
 *
 * Content is whatever JSX children or a reactive function can produce. Arrays are flattened
 * at any depth, and items that render nothing are skipped. This is the one place that knows
 * the kinds of content; renderers only decide what to do with each kind.
 */
export function visitContent(content: any, visitor: ContentVisitor) {
  if (Array.isArray(content)) {
    content.forEach(item => visitContent(item, visitor));
  } else if (content instanceof BaseComponent) {
    visitor.component(content);
  } else if (content instanceof Node) {
    visitor.node(content);
  } else if (typeof content === 'function') {
    visitor.dynamic(content);
  } else if (isRenderable(content)) {
    visitor.text(String(content));
  }
}
