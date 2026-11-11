import { Computation } from './Computation';
import { onCleanup } from './context';
import { signal } from './signal';
import { Cleanup, EffectFn, ReadSignal } from './types';

/**
 * Runs `fn` now and again whenever a signal it read changes.
 *
 * `fn` may return a cleanup that runs before the next run and on disposal. The effect is
 * owned by the current component or effect, if any, and is disposed together with it.
 *
 * @returns a function that disposes the effect.
 */
export function effect(fn: EffectFn): Cleanup {
  const computation = new Computation(fn);
  const dispose = () => computation.dispose();

  // Register before the first run, so the effect is still released with its owner
  // if that run throws.
  onCleanup(dispose);
  computation.run();

  return dispose;
}

/**
 * Creates a read-only signal whose value is derived from other signals.
 *
 * The value is computed eagerly and kept up to date by an effect. Subscribers are notified
 * only when the derived value actually changes.
 */
export function computed<T>(fn: () => T): ReadSignal<T> {
  const value = signal<T>(undefined as T);

  effect(() => value.set(fn()));

  // Expose only reading, so the derived value cannot be overwritten from outside.
  const read = (() => value()) as ReadSignal<T>;
  read.peek = value.peek;

  return read;
}
