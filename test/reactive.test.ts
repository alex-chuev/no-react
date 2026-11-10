import { describe, expect, it, vi } from 'vitest';
import { batch, computed, effect, onCleanup, signal, untrack } from 'no-react';

describe('signals', () => {
  it('reads, sets and updates', () => {
    const count = signal(1);
    count.set(2);
    count.update(n => n + 1);

    expect(count()).toBe(3);
  });

  it('re-runs effects that read a changed signal', () => {
    const count = signal(0);
    const seen: number[] = [];

    effect(() => {
      seen.push(count());
    });
    count.set(1);
    count.set(1);
    count.set(2);

    expect(seen).toEqual([0, 1, 2]);
  });

  it('tracks dependencies dynamically', () => {
    const useA = signal(true);
    const a = signal('a');
    const b = signal('b');
    const run = vi.fn(() => useA() ? a() : b());

    effect(run);
    useA.set(false);
    a.set('a2');

    expect(run).toHaveBeenCalledTimes(2);
  });

  it('derives values with computed', () => {
    const count = signal(2);
    const double = computed(() => count() * 2);
    const seen: number[] = [];

    effect(() => {
      seen.push(double());
    });
    count.set(5);

    expect(seen).toEqual([4, 10]);
  });

  it('runs a diamond dependency once per batch', () => {
    const first = signal('a');
    const last = signal('b');
    const run = vi.fn(() => `${first()} ${last()}`);

    effect(run);
    batch(() => {
      first.set('c');
      last.set('d');
    });

    expect(run).toHaveBeenCalledTimes(2);
  });

  it('does not track inside untrack or peek', () => {
    const count = signal(0);
    const run = vi.fn(() => untrack(count) + count.peek());

    effect(run);
    count.set(1);

    expect(run).toHaveBeenCalledTimes(1);
  });

  it('runs cleanups before re-running and on dispose', () => {
    const count = signal(0);
    const cleanup = vi.fn();
    const dispose = effect(() => {
      count();
      onCleanup(cleanup);
    });

    count.set(1);
    expect(cleanup).toHaveBeenCalledTimes(1);

    dispose();
    expect(cleanup).toHaveBeenCalledTimes(2);

    count.set(2);
    expect(cleanup).toHaveBeenCalledTimes(2);
  });

  it('disposes nested effects when the parent re-runs', () => {
    const outer = signal(0);
    const inner = signal(0);
    const run = vi.fn();

    effect(() => {
      outer();
      effect(() => run(inner()));
    });
    outer.set(1);
    inner.set(1);

    expect(run).toHaveBeenCalledTimes(3);
  });
});
