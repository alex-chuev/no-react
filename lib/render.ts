import { BaseComponent } from './BaseComponent';

/**
 * The component rendered into each container, so rendering again can destroy it.
 * A `WeakMap` does not keep removed containers alive.
 */
const mounted = new WeakMap<Element, BaseComponent>();

/**
 * Mounts `component` into `element`, destroying whatever was rendered there before.
 *
 * @returns the mounted component.
 */
export function render<C extends BaseComponent>(component: C, element: Element | HTMLElement): C {
  const previous = mounted.get(element);

  if (previous && previous !== component) {
    previous.destroy();
  }

  // Also clears anything the container held before the first render.
  element.innerHTML = '';
  element.appendChild(component.element);
  mounted.set(element, component);

  return component;
}
