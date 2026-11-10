import { createElement } from './lib/createElement';
import { Properties } from './interfaces/Properties';

export type { JSX } from './interfaces/JSX';

/**
 * Entry point for the automatic JSX runtime (`"jsxImportSource": "no-react"`).
 */
export function jsx(element: any, properties: Properties) {
  const { children, ...rest } = properties || {};

  if (Array.isArray(children)) {
    return createElement(element, rest, ...children);
  }

  return children === undefined
    ? createElement(element, rest)
    : createElement(element, rest, children);
}

export { jsx as jsxs, jsx as jsxDEV };
