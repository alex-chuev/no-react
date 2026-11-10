import { BaseComponent } from './BaseComponent';

const mounted = new WeakMap<Element, BaseComponent>();

/**
 * Mounts `component` into `element`, destroying whatever was rendered there before.
 */
export function render<C extends BaseComponent>(component: C, element: Element | HTMLElement): C {
  const previous = mounted.get(element);

  if (previous && previous !== component) {
    previous.destroy();
  }

  element.innerHTML = '';
  element.appendChild(component.element);
  mounted.set(element, component);

  return component;
}
