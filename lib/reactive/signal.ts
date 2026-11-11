import { getObserver } from './context';
import { schedule } from './scheduler';
import { Signal, Subscribers } from './types';

/**
 * Creates a signal holding `initial`.
 *
 * Reading the signal (`s()`) inside an effect subscribes that effect; `s.set(value)`
 * re-runs every subscribed effect. The signal itself is a function, so it can be passed
 * as a JSX child or property directly to keep the DOM up to date.
 */
export function signal<T>(initial: T): Signal<T> {
  let value = initial;
  const subscribers: Subscribers = new Set();

  const read = (() => {
    getObserver()?.track(subscribers);

    return value;
  }) as Signal<T>;

  read.peek = () => value;

  read.set = (next: T) => {
    // Writing the same value is a no-op, so effects never run for nothing.
    if (!Object.is(value, next)) {
      value = next;
      schedule(subscribers);
    }
  };

  read.update = fn => read.set(fn(value));

  return read;
}
