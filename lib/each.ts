import { BaseComponent } from './BaseComponent';
import { untrack } from './reactive';

/**
 * Keyed list rendering: items whose key survives an update keep their component
 * (and its DOM) instead of being rendered again.
 *
 * The result is a reactive child: it re-runs when the signals read by `list` change,
 * and the region it is rendered into moves kept components and destroys dropped ones.
 *
 * @param list returns the current items; usually a signal.
 * @param render creates the component of one item.
 * @param key identifies an item across updates; defaults to the item itself.
 */
export function each<T>(
  list: () => T[],
  render: (item: T) => BaseComponent,
  key: (item: T) => any = item => item,
): () => BaseComponent[] {
  // Components of the previous update, by key.
  let cache = new Map<any, BaseComponent>();

  return () => {
    // Only reading the list is tracked; the region must not re-run because of what
    // `render` or `key` read.
    const items = list();

    return untrack(() => {
      const next = new Map<any, BaseComponent>();

      const components = items.map(item => {
        const itemKey = key(item);

        // A duplicate key cannot reuse the cached component, which is shown once already.
        if (next.has(itemKey)) {
          return render(item);
        }

        const component = cache.get(itemKey) || render(item);
        next.set(itemKey, component);

        return component;
      });

      // Components left in the old cache are no longer returned; the region destroys them.
      cache = next;

      return components;
    });
  };
}
