import { Subscriber, Subscribers } from './types';

/**
 * How many `batch` calls are currently running. Nothing flushes while it is above zero.
 */
let batchDepth = 0;

/**
 * Whether `flush` is running. Writes made by running subscribers only queue more work.
 */
let flushing = false;

/**
 * Subscribers waiting to run. A `Set` keeps the order of insertion and runs
 * each subscriber once, however many of its sources changed.
 */
const pending = new Set<Subscriber>();

/**
 * Runs pending subscribers until none are left, including ones queued while flushing.
 */
function flush() {
  flushing = true;

  try {
    while (pending.size) {
      const subscriber = pending.values().next().value!;
      pending.delete(subscriber);
      subscriber.run();
    }
  } finally {
    // If a subscriber throws, the rest of the queue is dropped instead of running
    // in a half-updated state on the next write.
    flushing = false;
    pending.clear();
  }
}

/**
 * Flushes right away unless a batch or a flush is already running; those flush when they end.
 */
function flushIfIdle() {
  if (!batchDepth && !flushing) {
    flush();
  }
}

/**
 * Queues `subscribers` to run after a source they depend on changed.
 */
export function schedule(subscribers: Subscribers) {
  subscribers.forEach(subscriber => pending.add(subscriber));
  flushIfIdle();
}

/**
 * Runs `fn`, delaying every update it causes until it returns, so each affected effect
 * runs a single time. Batches can be nested; only the outermost one flushes.
 */
export function batch<T>(fn: () => T): T {
  batchDepth++;

  try {
    return fn();
  } finally {
    batchDepth--;
    flushIfIdle();
  }
}
