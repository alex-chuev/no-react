export const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

/**
 * Tags that are created in the SVG namespace. JSX has no notion of namespaces, so the tag
 * name alone decides it. Tags shared with HTML (a, title, style, script) are left out
 * and stay HTML elements.
 */
const SVG_TAGS = new Set([
  'svg', 'g', 'defs', 'symbol', 'use', 'path', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'rect',
  'text', 'tspan', 'textPath', 'clipPath', 'mask', 'pattern', 'marker', 'linearGradient', 'radialGradient',
  'stop', 'filter', 'image', 'foreignObject',
]);

/**
 * Whether an element with this tag name must be created as an SVG element.
 */
export function isSvgTag(tagName: string) {
  return SVG_TAGS.has(tagName);
}

/**
 * Whether `element` is an SVG element. SVG elements take attributes instead of DOM
 * properties, and their `className` is not a plain string.
 */
export function isSvgElement(element: Element) {
  return element.namespaceURI === SVG_NAMESPACE;
}
