import { Component, computed, each, render, signal, Signal } from 'no-react';

interface Todo {
  id: number;
  title: string;
  done: Signal<boolean>;
}

type Filter = 'all' | 'active' | 'done';

const TodoItem = ({todo, onRemove}: { todo: Todo, onRemove: (todo: Todo) => void }) => (
  <li className={() => todo.done() ? 'done' : ''}>
    <input type="checkbox" checked={todo.done} onChange={() => todo.done.update(done => !done)} />
    <span>{todo.title}</span>
    <button onClick={() => onRemove(todo)}>×</button>
  </li>
);

class TodoApp extends Component {
  todos = signal<Todo[]>([]);
  filter = signal<Filter>('all');
  remaining = computed(() => this.todos().filter(todo => !todo.done()).length);
  nextId = 1;

  visible = () => this.todos().filter(todo => {
    switch (this.filter()) {
      case 'active': return !todo.done();
      case 'done': return todo.done();
      default: return true;
    }
  });

  add(title: string) {
    this.todos.update(todos => [...todos, {id: this.nextId++, title, done: signal(false)}]);
  }

  remove = (todo: Todo) => this.todos.update(todos => todos.filter(item => item !== todo));

  render() {
    let input!: HTMLInputElement;

    const submit = (event: Event) => {
      event.preventDefault();

      if (input.value.trim()) {
        this.add(input.value.trim());
        input.value = '';
      }
    };

    const filterButton = (filter: Filter) => (
      <button aria-pressed={() => this.filter() === filter} onClick={() => this.filter.set(filter)}>{filter}</button>
    );

    return (
      <section>
        <h1>Todos</h1>
        <form onSubmit={submit}>
          <input type="text" placeholder="What needs to be done?" ref={(el: HTMLInputElement) => input = el} />
          <button>Add</button>
        </form>
        <ul>{each(this.visible, todo => <TodoItem todo={todo} onRemove={this.remove} />, todo => todo.id)}</ul>
        <footer>
          {() => `${this.remaining()} left`}
          {filterButton('all')}
          {filterButton('active')}
          {filterButton('done')}
        </footer>
      </section>
    );
  }
}

render(<TodoApp />, document.getElementById('app')!);
