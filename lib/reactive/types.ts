/**
 * A function that releases something: unsubscribes a listener, stops a timer,
 * destroys a component. Cleanups run at most once.
 */
export type Cleanup = () => void;

/**
 * The body of an effect. It may return a cleanup, which runs before the next run of
 * the effect and when the effect is disposed.
 */
export type EffectFn = (() => void) | (() => Cleanup);

/**
 * Collects cleanups of whatever was created while it is the current owner.
 *
 * Components and computations are owners: effects created while rendering a component
 * (or while running an effect) register their `dispose` here, so they are released
 * together with the thing that created them.
 */
export interface Owner {
  /**
   * Registers `dispose` to run when the owner is destroyed or reset.
   */
  own(dispose: Cleanup): void;
}

/**
 * Is notified when a source it depends on changes.
 */
export interface Subscriber {
  /**
   * Re-runs the subscriber. Called by the scheduler, never directly by signals.
   */
  run(): void;
}

/**
 * The subscribers of one source (a signal). A source owns this set; observers add
 * themselves to it while they read the source.
 */
export type Subscribers = Set<Subscriber>;

/**
 * Records the sources read while it is the current observer.
 */
export interface Observer {
  /**
   * Called by a source when it is read, with the set the observer should subscribe to.
   */
  track(subscribers: Subscribers): void;
}

/**
 * A readable signal. Calling it returns the value and subscribes the current observer.
 */
export interface ReadSignal<T> {
  (): T;

  /**
   * Returns the value without subscribing to it.
   */
  peek(): T;
}

/**
 * A readable and writable signal.
 */
export interface Signal<T> extends ReadSignal<T> {
  /**
   * Replaces the value. Subscribers are notified only if the value actually changed
   * (compared with `Object.is`).
   */
  set(value: T): void;

  /**
   * Replaces the value with the result of `fn` applied to the current one.
   */
  update(fn: (value: T) => T): void;
}
