import { isSvgTag, SVG_NAMESPACE } from './svg';

/**
 * Creates the DOM nodes the library renders.
 *
 * Components and content renderers receive a factory instead of calling `document`
 * themselves, so node creation can be replaced (another document, an iframe, a test double).
 */
export interface NodeFactory {
  /**
   * Creates an element, picking the namespace from the tag name.
   */
  element(tagName: string): Element;

  /**
   * Creates a text node for rendered primitives.
   */
  text(data: string): Text;

  /**
   * Creates an empty comment that marks where a reactive region ends.
   */
  marker(): Comment;
}

/**
 * The default factory, creating nodes in the global `document`.
 */
export const documentNodeFactory: NodeFactory = {
  element: tagName => isSvgTag(tagName)
    ? document.createElementNS(SVG_NAMESPACE, tagName)
    : document.createElement(tagName),
  text: data => document.createTextNode(data),
  marker: () => document.createComment(''),
};
