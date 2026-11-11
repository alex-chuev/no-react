# NoReact

A tiny (~3KB gzipped) library for building user interfaces with the ReactJS approach and JSX syntax — but without a virtual DOM.

JSX in NoReact creates **real DOM elements**. There is no diffing and no re-rendering of whole components: when state changes, **signals** update exactly the text node or attribute that depends on them. Maximum of the native JavaScript.

### Why NoReact?

- **JSX gives you real DOM.** `<div/>` is an `HTMLDivElement`, so `element.animate()`, `focus()` or any DOM library work directly — no refs or escape hatches needed.
- **No virtual DOM, no diffing, no re-renders.** A component renders once; a changed signal updates only what is bound to it.
- **No special compiler.** It works with the standard JSX transform of TypeScript, esbuild, Vite and Babel.
- **Tiny and dependency-free:** ~3KB gzipped, and the whole source is small enough to read in one sitting.

### When to use it

- **Widgets on existing pages** — a date picker, a cart badge or a comment box on a server-rendered site. Works from a plain `<script>` tag.
- **Embeddable scripts for other sites** — chat bubbles, feedback forms, banners — where the bundle must stay small and must not conflict with the host page.
- **Browser extensions and userscripts** that add UI to existing pages.
- **UI around DOM-heavy libraries** — maps, charts, code editors, canvas or WebGL — which want real DOM nodes: `<div ref={el => new Map(el)}/>`.
- **Frequent small updates** — dashboards, tickers, timers, games — where only the bound text node changes on every tick.
- **Small apps and prototypes** — internal tools, admin panels, demos — when you want JSX and components without React's setup or size.
- **Learning** how JSX, components and signals work under the hood.

### When not to use it

- You need server-side rendering, hydration, context, Suspense or a large ecosystem of ready-made components — use React, Preact or Solid.
- You need fragments: for now every component has a single root element.

### To install the library:

    npm i --save no-react

### Setup

Use the automatic JSX runtime (TypeScript, esbuild, Vite, Babel):

    // tsconfig.json
    {
      "compilerOptions": {
        "jsx": "react-jsx",
        "jsxImportSource": "no-react"
      }
    }

Or the classic one with `"jsx": "react"` and `"jsxFactory": "NoReact.createElement"`, importing `NoReact` in every file that uses JSX.

Without a build step, use the global build: `<script src="https://unpkg.com/no-react"></script>` exposes `window.NoReact`.

### Creation of a component

    import { Component } from 'no-react';

    export class Content extends Component {
      render(content) {
        return (
          <article className="content">{content}</article>
        );
      }
    }

Or as a function:

    export const Content = (properties, content) => (
      <article className="content">{content}</article>
    );

Or without JSX:

    NoReact.createElement('article', {className: 'content'}, content);

Every JSX expression gives you a component whose `element` is the real DOM node, so native APIs are always at hand:

    const box = <div />;
    box.element.animate([{opacity: 0}, {opacity: 1}], 300);

Native DOM nodes can also be used as children: `<div>{document.createElement('canvas')}</div>`.

### To render a component

    import { render } from 'no-react';
    import { App } from './components/App';

    render(<App/>, document.body);

Rendering into the same container again destroys the previously rendered component.

### Reactivity with signals

    import { Component, signal, computed } from 'no-react';

    class Counter extends Component {
      count = signal(0);
      double = computed(() => this.count() * 2);

      render() {
        return (
          <button onClick={() => this.count.update(n => n + 1)}>
            {this.count} × 2 = {this.double}
          </button>
        );
      }
    }

The rule is simple: **a function passed as a child or a property is reactive**. NoReact runs it, remembers which signals it read, and re-runs it when they change:

    <p className={() => this.active() ? 'on' : 'off'}>{() => this.active() ? 'On' : 'Off'}</p>

Values read outside a function are static: `{this.count()}` renders once, `{this.count}` or `{() => this.count()}` stays up to date.

A reactive child can return anything renderable — text, elements, components, arrays, `null` — and switching what it returns destroys the old content:

    <div>{() => this.user() ? <Profile user={this.user()}/> : <LoginForm/>}</div>

API:

- `signal(value)` — `s()` reads (and tracks), `s.peek()` reads without tracking, `s.set(value)`, `s.update(fn)`.
- `computed(fn)` — a read-only signal derived from other signals.
- `effect(fn)` — runs `fn` now and whenever its signals change; `fn` may return a cleanup. Returns a `dispose` function. Effects created inside a component are disposed when the component is destroyed.
- `batch(fn)` — applies several updates at once, running each affected effect a single time.
- `untrack(fn)` — reads signals without subscribing to them.
- `onCleanup(fn)` — registers a cleanup in the current effect or component.

### Lists

`each(list, render, key?)` renders a keyed list. Items whose key survives an update keep their DOM and component, and are just moved:

    <ul>{each(this.todos, todo => <TodoItem todo={todo}/>, todo => todo.id)}</ul>

The key defaults to the item itself. To change an item in place, keep signals inside items rather than replacing them.

### Properties

- `onClick`, `onInput`, ... (and the old lowercase `onclick`) attach event listeners.
- `className` / `class`, `style` as a string or an object (`{color: 'red', 'margin-top': '2px'}`).
- DOM properties (`value`, `checked`, `disabled`, ...) are set as properties, anything else (`data-*`, `aria-*`, ...) as attributes; `null` and `false` remove an attribute.
- Properties are set after the children are appended, so `<select value="b">` selects its option. Setting `innerHTML` or `textContent` as a property therefore replaces the JSX children.
- `ref={el => ...}` is called with the element once its children are appended.
- SVG tags are created in the SVG namespace.

### Component lifecycle

There are several methods in the component lifecycle:

    export class SomeComponent extends Component {

      beforeRender() {}

      render(childContent) {}

      afterRender() {}


      beforeDestroy() {}

      afterDestroy() {}

    }

`destroy()` removes the component's element, destroys its children and disposes all of its effects.

### Examples

More than twenty runnable examples, from a counter to a todo app, a data table, a router and a web component, live in a separate repository: [no-react-example](https://github.com/alex-chuev/no-react-example) ([live demo](https://alex-chuev.github.io/no-react-example/)).

`examples/todo` in this repository contains a small todo app. Run it with `npm run example` and open the printed address.

### Upgrading from 1.x

- The class components API and `createElement` / `render` work as before.
- `render()` of a class component now runs after the constructor, so class fields are available in it.
- `import NoReact from 'no-react'` now works; named imports are available too.
- Event handlers are attached with `addEventListener`, attributes that are not DOM properties are set with `setAttribute`.
- The package is ES modules only; the global build replaces the UMD one.

### Development

    npm test            # vitest + jsdom
    npm run typecheck
    npm run build
