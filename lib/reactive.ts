export type Cleanup = () => void;

export type EffectFn = (() => void) | (() => Cleanup);

export interface Owner {
  own(dispose: Cleanup): void;
}

export interface ReadSignal<T> {
  (): T;
  peek(): T;
}

export interface Signal<T> extends ReadSignal<T> {
  set(value: T): void;
  update(fn: (value: T) => T): void;
}

let currentOwner: Owner | null = null;
let currentObserver: Computation | null = null;
let batchDepth = 0;
let flushing = false;
const pending = new Set<Computation>();

class Computation implements Owner {
  private sources = new Set<Set<Computation>>();
  private cleanups: Cleanup[] = [];
  private disposed = false;

  constructor(private fn: EffectFn) {
  }

  own(dispose: Cleanup) {
    this.cleanups.push(dispose);
  }

  track(subscribers: Set<Computation>) {
    subscribers.add(this);
    this.sources.add(subscribers);
  }

  run() {
    if (this.disposed) {
      return;
    }

    this.reset();

    const prevObserver = currentObserver;
    const prevOwner = currentOwner;
    currentObserver = this;
    currentOwner = this;

    try {
      const cleanup = this.fn();

      if (typeof cleanup === 'function') {
        this.cleanups.push(cleanup);
      }
    } finally {
      currentObserver = prevObserver;
      currentOwner = prevOwner;
    }
  }

  dispose() {
    if (!this.disposed) {
      this.disposed = true;
      this.reset();
    }
  }

  private reset() {
    this.sources.forEach(subscribers => subscribers.delete(this));
    this.sources.clear();

    const cleanups = this.cleanups;
    this.cleanups = [];
    cleanups.forEach(cleanup => cleanup());
  }
}

function flush() {
  flushing = true;

  try {
    while (pending.size) {
      const computation = pending.values().next().value!;
      pending.delete(computation);
      computation.run();
    }
  } finally {
    flushing = false;
    pending.clear();
  }
}

function schedule(subscribers: Set<Computation>) {
  subscribers.forEach(computation => pending.add(computation));

  if (!batchDepth && !flushing) {
    flush();
  }
}

export function signal<T>(initial: T): Signal<T> {
  let value = initial;
  const subscribers = new Set<Computation>();

  const read = (() => {
    if (currentObserver) {
      currentObserver.track(subscribers);
    }

    return value;
  }) as Signal<T>;

  read.peek = () => value;

  read.set = (next: T) => {
    if (!Object.is(value, next)) {
      value = next;
      schedule(subscribers);
    }
  };

  read.update = fn => read.set(fn(value));

  return read;
}

export function effect(fn: EffectFn): Cleanup {
  const computation = new Computation(fn);
  const dispose = () => computation.dispose();

  if (currentOwner) {
    currentOwner.own(dispose);
  }

  computation.run();

  return dispose;
}

export function computed<T>(fn: () => T): ReadSignal<T> {
  const value = signal<T>(undefined as T);

  effect(() => value.set(fn()));

  const read = (() => value()) as ReadSignal<T>;
  read.peek = value.peek;

  return read;
}

export function batch<T>(fn: () => T): T {
  batchDepth++;

  try {
    return fn();
  } finally {
    batchDepth--;

    if (!batchDepth && !flushing) {
      flush();
    }
  }
}

export function untrack<T>(fn: () => T): T {
  const prevObserver = currentObserver;
  currentObserver = null;

  try {
    return fn();
  } finally {
    currentObserver = prevObserver;
  }
}

export function onCleanup(fn: Cleanup) {
  if (currentOwner) {
    currentOwner.own(fn);
  }
}

/**
 * Runs `fn` untracked, with `owner` collecting every effect and cleanup created inside.
 */
export function runInScope<T>(owner: Owner | null, fn: () => T): T {
  const prevOwner = currentOwner;
  currentOwner = owner;

  try {
    return untrack(fn);
  } finally {
    currentOwner = prevOwner;
  }
}
