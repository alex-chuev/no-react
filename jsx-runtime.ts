import { createElement } from './lib/createElement';
import { Properties } from './interfaces/Properties';

export type { JSX } from './interfaces/JSX';

/**
 * Entry point for the automatic JSX runtime (`"jsxImportSource": "no-react"`).
 *
 * The automatic runtime passes children inside `properties.children` (a single child or
 * an array); this unpacks them into the `createElement(type, properties, ...children)` form.
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

// `jsxs` (static children) and `jsxDEV` (development builds) need no special handling.
export { jsx as jsxs, jsx as jsxDEV };
