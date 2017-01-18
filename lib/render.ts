import { BaseComponent } from './BaseComponent';

export function render(component: BaseComponent, element: Element|HTMLElement) {
  element.innerHTML = '';
  element.appendChild(component.element);
}
