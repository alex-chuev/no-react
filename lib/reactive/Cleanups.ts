import { Cleanup, Owner } from './types';

/**
 * A list of cleanups that runs, and forgets, all of them at once.
 *
 * Both components and computations keep one: whatever they create registers its cleanup
 * here, and `run` releases everything when the owner is destroyed or re-run.
 */
export class Cleanups implements Owner {
  private cleanups: Cleanup[] = [];

  /**
   * Adds `cleanup` to the list.
   */
  own(cleanup: Cleanup) {
    this.cleanups.push(cleanup);
  }

  /**
   * Runs every registered cleanup in registration order and empties the list.
   */
  run() {
    // The list is swapped out before running, so cleanups registered while running
    // (or a nested `run`) cannot make a cleanup run twice.
    const cleanups = this.cleanups;
    this.cleanups = [];
    cleanups.forEach(cleanup => cleanup());
  }
}
