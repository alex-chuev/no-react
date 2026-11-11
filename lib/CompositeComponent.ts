import { Properties } from '../interfaces/Properties';
import { BaseComponent } from './BaseComponent';

/**
 * A component that renders another component and takes its element as its own.
 *
 * Class and function components have no DOM of their own: whatever they return becomes
 * their root, and its element is the element of the component.
 */
export abstract class CompositeComponent<P extends Properties = Properties> extends BaseComponent<P> {
  /**
   * Makes `root` the single rendered child of this component.
   */
  protected adoptRoot(root: BaseComponent) {
    this.element = root.element;
    this.adopt(root);
  }
}
