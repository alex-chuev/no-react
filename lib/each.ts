import { BaseComponent } from './BaseComponent';
import { untrack } from './reactive';

/**
 * Keyed list rendering: items whose key survives an update keep their component
 * (and its DOM) instead of being rendered again.
 */
export function each<T>(
  list: () => T[],
  render: (item: T) => BaseComponent,
  key: (item: T) => any = item => item,
): () => BaseComponent[] {
  let cache = new Map<any, BaseComponent>();

  return () => {
    const items = list();

    return untrack(() => {
      const next = new Map<any, BaseComponent>();

      const components = items.map(item => {
        const itemKey = key(item);

        if (next.has(itemKey)) {
          return render(item);
        }

        const component = cache.get(itemKey) || render(item);
        next.set(itemKey, component);

        return component;
      });

      cache = next;

      return components;
    });
  };
}
