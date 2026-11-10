import { BaseComponent } from './BaseComponent';
import { effect } from './reactive';

interface Rendered {
  nodes: Node[];
  components: BaseComponent[];
}

/**
 * Appends static content to `parent`. Functions become reactive regions
 * that re-render in place whenever the signals they read change.
 */
export function appendContent(parent: Node, owner: BaseComponent, content: any) {
  if (Array.isArray(content)) {
    content.forEach(item => appendContent(parent, owner, item));
  } else if (content instanceof BaseComponent) {
    parent.appendChild(content.element);
    owner.children.push(content);
  } else if (content instanceof Node) {
    parent.appendChild(content);
  } else if (typeof content === 'function') {
    appendRegion(parent, owner, content);
  } else if (isRenderable(content)) {
    parent.appendChild(document.createTextNode(String(content)));
  }
}

function isRenderable(content: any) {
  return content != null && typeof content !== 'boolean';
}

function appendRegion(parent: Node, owner: BaseComponent, fn: () => any) {
  const end = document.createComment('');
  let current: Rendered = {nodes: [], components: []};

  parent.appendChild(end);

  effect(() => {
    const value = fn();

    if (updateText(current, value)) {
      return;
    }

    const next: Rendered = {nodes: [], components: []};
    collect(value, next);

    const keptComponents = new Set(next.components);
    current.components
      .filter(component => !keptComponents.has(component))
      .forEach(component => component.destroy());

    const keptNodes = new Set(next.nodes);
    current.nodes
      .filter(node => !keptNodes.has(node) && node.parentNode)
      .forEach(node => node.parentNode!.removeChild(node));

    let ref: Node = end;

    for (let i = next.nodes.length - 1; i >= 0; i--) {
      const node = next.nodes[i];

      if (node.nextSibling !== ref) {
        parent.insertBefore(node, ref);
      }

      ref = node;
    }

    current = next;
  });

  owner.own(() => current.components.forEach(component => component.destroy()));
}

/**
 * Fast path: a region that keeps rendering a single primitive just updates its text node.
 */
function updateText(current: Rendered, value: any) {
  const [node] = current.nodes;

  if (current.nodes.length === 1 && node instanceof Text && isRenderable(value) && typeof value !== 'object' && typeof value !== 'function') {
    node.data = String(value);
    return true;
  }

  return false;
}

function collect(value: any, into: Rendered) {
  if (Array.isArray(value)) {
    value.forEach(item => collect(item, into));
  } else if (value instanceof BaseComponent) {
    into.nodes.push(value.element);
    into.components.push(value);
  } else if (value instanceof Node) {
    into.nodes.push(value);
  } else if (typeof value === 'function') {
    collect(value(), into);
  } else if (isRenderable(value)) {
    into.nodes.push(document.createTextNode(String(value)));
  }
}
