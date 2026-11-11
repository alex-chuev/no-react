import type { BaseComponent } from '../lib/BaseComponent';
import type { Owner } from '../lib/reactive';

/**
 * What rendered content needs from the component it is rendered into.
 *
 * Content only has to hand over the components it renders (`adopt`) and the cleanups of
 * its reactive regions (`own`); it does not depend on the rest of the component API.
 */
export interface ContentHost extends Owner {
  /**
   * Takes `child` as a child component, destroying it when the host is destroyed.
   */
  adopt(child: BaseComponent): void;
}
