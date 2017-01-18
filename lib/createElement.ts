import { ElementComponent } from './ElementComponent';
import { Properties } from '../interfaces/Properties';

export function createElement(element: any, properties: Properties, ...content: any[]) {
  if (typeof element === 'string') {
    return new ElementComponent(element, properties, content);
  } else {
    return new element(properties, content);
  }
}
