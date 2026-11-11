import { Cleanups } from './Cleanups';
import { runWith } from './context';
import { Cleanup, EffectFn, Observer, Owner, Subscriber, Subscribers } from './types';

/**
 * Runs a function, re-running it whenever a source it read changes.
 *
 * It plays three roles at once:
 * - an `Observer`, recording the signals its function reads;
 * - a `Subscriber`, re-run by the scheduler when one of them changes;
 * - an `Owner` of the effects and cleanups created by its function.
 *
 * Dependencies are collected again on every run, so a branch that is no longer taken
 * stops triggering updates.
 */
export class Computation implements Owner, Observer, Subscriber {
  /**
   * Subscriber sets of the sources read during the last run.
   */
  private sources = new Set<Subscribers>();

  /**
   * Cleanups returned by the function and registered by effects created inside it.
   */
  private cleanups = new Cleanups();

  private disposed = false;

  constructor(private fn: EffectFn) {
  }

  own(dispose: Cleanup) {
    this.cleanups.own(dispose);
  }

  /**
   * Subscribes to a source and remembers it, so `reset` can unsubscribe later.
   */
  track(subscribers: Subscribers) {
    subscribers.add(this);
    this.sources.add(subscribers);
  }

  /**
   * Releases the previous run and runs the function again as the current owner and observer.
   */
  run() {
    if (this.disposed) {
      return;
    }

    this.reset();

    const cleanup = runWith(this, this, this.fn);

    if (typeof cleanup === 'function') {
      this.own(cleanup);
    }
  }

  /**
   * Stops the computation for good: unsubscribes from its sources and runs its cleanups.
   */
  dispose() {
    if (!this.disposed) {
      this.disposed = true;
      this.reset();
    }
  }

  /**
   * Unsubscribes from every source and runs the cleanups of the last run.
   */
  private reset() {
    this.sources.forEach(subscribers => subscribers.delete(this));
    this.sources.clear();
    this.cleanups.run();
  }
}
