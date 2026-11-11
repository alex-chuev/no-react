import { Cleanup, Observer, Owner } from './types';

/**
 * Receives cleanups of effects created right now: a rendering component or a running effect.
 */
let currentOwner: Owner | null = null;

/**
 * Subscribes to signals read right now: a running effect, or `null` when reads are untracked.
 */
let currentObserver: Observer | null = null;

/**
 * Returns the owner that cleanups created right now belong to, if any.
 */
export function getOwner() {
  return currentOwner;
}

/**
 * Returns the observer that signals read right now should subscribe, if any.
 */
export function getObserver() {
  return currentObserver;
}

/**
 * Runs `fn` with `owner` and `observer` as the current ones, restoring the previous ones afterwards.
 *
 * Calls nest like a stack, so an effect created inside another effect (or inside a component)
 * temporarily takes over and hands the context back when it is done, even if `fn` throws.
 */
export function runWith<T>(owner: Owner | null, observer: Observer | null, fn: () => T): T {
  const prevOwner = currentOwner;
  const prevObserver = currentObserver;
  currentOwner = owner;
  currentObserver = observer;

  try {
    return fn();
  } finally {
    currentOwner = prevOwner;
    currentObserver = prevObserver;
  }
}

/**
 * Runs `fn` without subscribing the current observer to the signals it reads.
 * The current owner is kept, so effects created inside are still cleaned up with it.
 */
export function untrack<T>(fn: () => T): T {
  return runWith(currentOwner, null, fn);
}

/**
 * Runs `fn` untracked, with `owner` collecting every effect and cleanup created inside.
 */
export function runInScope<T>(owner: Owner | null, fn: () => T): T {
  return runWith(owner, null, fn);
}

/**
 * Registers `fn` in the current effect or component. It runs before the effect re-runs,
 * or when the effect or component is destroyed. Outside of any owner it is ignored.
 */
export function onCleanup(fn: Cleanup) {
  if (currentOwner) {
    currentOwner.own(fn);
  }
}
