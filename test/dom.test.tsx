import { describe, expect, it, vi } from 'vitest';
import NoReact, { BaseComponent, Component, each, effect, render, signal } from 'no-react';

const html = (component: BaseComponent) => component.element.outerHTML.replace(/<!---->/g, '');

describe('elements', () => {
  it('creates real DOM elements', () => {
    const view = <p className="text" id="greeting">Hello, {'world'}!</p>;

    expect(view.element).toBeInstanceOf(HTMLParagraphElement);
    expect(html(view)).toBe('<p class="text" id="greeting">Hello, world!</p>');
  });

  it('sets attributes that are not DOM properties', () => {
    const view = <div data-id="7" aria-label="Box" hidden={false} />;

    expect(view.element.getAttribute('data-id')).toBe('7');
    expect(view.element.getAttribute('aria-label')).toBe('Box');
    expect((view.element as HTMLElement).hidden).toBe(false);
  });

  it('applies style objects and strings', () => {
    const objectStyle = <div style={{color: 'red', 'margin-top': '2px'}} />;
    const stringStyle = <div style="color: blue" />;

    expect((objectStyle.element as HTMLElement).style.color).toBe('red');
    expect((objectStyle.element as HTMLElement).style.marginTop).toBe('2px');
    expect((stringStyle.element as HTMLElement).style.color).toBe('blue');
  });

  it('attaches event listeners for camelCase and lowercase handlers', () => {
    const onClick = vi.fn();
    const onclick = vi.fn();
    const view = <div><button onClick={onClick} /><button onclick={onclick} /></div>;

    view.element.querySelectorAll('button').forEach(button => button.click());

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onclick).toHaveBeenCalledTimes(1);
  });

  it('calls ref with the element after its children are appended', () => {
    let childCount = -1;
    const view = <ul ref={(el: Element) => childCount = el.children.length}><li /><li /></ul>;

    expect(childCount).toBe(2);
    expect(view.element.tagName).toBe('UL');
  });

  it('accepts native DOM nodes as children', () => {
    const native = document.createElement('canvas');
    const view = <div>{native}</div>;

    expect(view.element.firstChild).toBe(native);
  });

  it('skips null, undefined and booleans', () => {
    expect(html(<div>{null}{undefined}{false}{true}{0}</div>)).toBe('<div>0</div>');
  });

  it('creates SVG elements in the SVG namespace', () => {
    const view = <svg viewBox="0 0 10 10"><circle className="dot" r="5" /></svg>;
    const circle = view.element.firstChild as Element;

    expect(view.element.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(circle.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(circle.getAttribute('class')).toBe('dot');
  });
});

describe('reactivity', () => {
  it('updates a text node in place', () => {
    const count = signal(0);
    const view = <span>Count: {count}</span>;
    const text = view.element.lastChild!.previousSibling;

    count.set(5);

    expect(html(view)).toBe('<span>Count: 5</span>');
    expect(view.element.lastChild!.previousSibling).toBe(text);
  });

  it('updates properties and attributes', () => {
    const active = signal(false);
    const view = <a className={() => active() ? 'on' : 'off'} data-state={() => active() && 'active'} />;

    expect(html(view)).toBe('<a class="off"></a>');

    active.set(true);

    expect(html(view)).toBe('<a class="on" data-state="active"></a>');
  });

  it('switches between elements', () => {
    const loggedIn = signal(false);
    const view = <div>{() => loggedIn() ? <b>Hi</b> : <i>Log in</i>}</div>;

    expect(html(view)).toBe('<div><i>Log in</i></div>');

    loggedIn.set(true);

    expect(html(view)).toBe('<div><b>Hi</b></div>');
  });

  it('keeps sibling content in place around a region', () => {
    const items = signal(['b']);
    const view = <p>a{() => items()}c</p>;

    items.set(['b1', 'b2']);
    expect(view.element.textContent).toBe('ab1b2c');

    items.set([]);
    expect(view.element.textContent).toBe('ac');
  });

  it('keeps keyed list items and reorders them', () => {
    const items = signal([{id: 1}, {id: 2}, {id: 3}]);
    const renderItem = vi.fn((item: { id: number }) => <li>{item.id}</li>);
    const view = <ul>{each(items, renderItem, item => item.id)}</ul>;
    const [first, second, third] = Array.from(view.element.children);

    items.set([{id: 3}, {id: 1}, {id: 4}]);

    const children = Array.from(view.element.children);
    expect(view.element.textContent).toBe('314');
    expect(children[0]).toBe(third);
    expect(children[1]).toBe(first);
    expect(second.isConnected).toBe(false);
    expect(renderItem).toHaveBeenCalledTimes(4);
  });

  it('stops updating destroyed elements', () => {
    const count = signal(0);
    const read = vi.fn(() => count());
    const view = <div>{read}</div>;

    view.destroy();
    count.set(1);

    expect(read).toHaveBeenCalledTimes(1);
  });
});

describe('components', () => {
  it('renders class components with initialized fields', () => {
    class Counter extends Component<{ start: number }> {
      count = signal(this.properties.start);

      render() {
        return <button onClick={() => this.count.update(n => n + 1)}>{this.count}</button>;
      }
    }

    const view = <Counter start={3} />;
    (view.element as HTMLElement).click();

    expect(view.element.textContent).toBe('4');
  });

  it('passes children to class and function components', () => {
    class Card extends Component {
      render(content: any[]) {
        return <section>{content}</section>;
      }
    }

    const Title = (props: { text: string }, content: any[]) => <h1>{props.text}{content}</h1>;

    expect(html(<Card><Title text="A">B</Title></Card>)).toBe('<section><h1>AB</h1></section>');
  });

  it('runs lifecycle hooks and disposes component effects', () => {
    const calls: string[] = [];
    const count = signal(0);

    class Lifecycle extends Component {
      beforeRender() { calls.push('beforeRender'); }
      afterRender() { calls.push('afterRender'); }
      beforeDestroy() { calls.push('beforeDestroy'); }
      afterDestroy() { calls.push('afterDestroy'); }

      render() {
        effect(() => calls.push(`effect ${count()}`));
        return <div />;
      }
    }

    const view = <Lifecycle />;
    view.destroy();
    count.set(1);

    expect(calls).toEqual(['beforeRender', 'effect 0', 'afterRender', 'beforeDestroy', 'afterDestroy']);
  });

  it('destroys components removed from a region', () => {
    const show = signal(true);
    const destroyed = vi.fn();

    class Child extends Component {
      afterDestroy() { destroyed(); }
      render() { return <i />; }
    }

    <div>{() => show() && <Child />}</div>;
    show.set(false);

    expect(destroyed).toHaveBeenCalledTimes(1);
  });

  it('does not re-create a region when a component reads signals during render', () => {
    const count = signal(0);
    const created = vi.fn();

    const Child = () => {
      created();
      return <i>{count()}</i>;
    };

    <div>{() => <Child />}</div>;
    count.set(1);

    expect(created).toHaveBeenCalledTimes(1);
  });
});

describe('render', () => {
  it('mounts into a container and destroys the previous component', () => {
    const container = document.createElement('div');
    const destroyed = vi.fn();

    class First extends Component {
      afterDestroy() { destroyed(); }
      render() { return <p>first</p>; }
    }

    render(<First />, container);
    render(<p>second</p>, container);

    expect(container.innerHTML).toBe('<p>second</p>');
    expect(destroyed).toHaveBeenCalledTimes(1);
  });

  it('supports the classic createElement API from v1', () => {
    class Content extends NoReact.Component {
      render(content: any[]) {
        return NoReact.createElement('article', {className: 'content'}, content);
      }
    }

    const container = document.createElement('div');
    NoReact.render(NoReact.createElement(Content, null, 'text'), container);

    expect(container.innerHTML).toBe('<article class="content">text</article>');
  });
});
