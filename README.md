# NoReact

This is a simple and lightweight (3KB) library for building user interfaces with ReactJS approach and using JSX syntax.

### To install the library:

    npm i --save no-react

### Example of usage

There is an example of an application in a separate repository - https://github.com/alex-chuev/no-react-example.

#### Creation of a component

    import NoReact from 'no-react';

    export class Content extends NoReact.Component {
      render(content) {
        return (
          <article className="content">{content}</article>
        );
      }
    }

Or without JSX:

    export class Content extends NoReact.Component {
      render(content) {
        return NoReact.createElement('article', {className: 'content'}, content);
      }
    }

#### To render a component

    import NoReact from 'no-react';

    import { App } from './components/App';

    NoReact.render(<App/>, document.body);

Or without JSX:

    NoReact.render(NoReact.createElement(App), document.body);

### Component lifecycle

There are several methods in the component lifecycle:

    export class SomeComponent extends NoReact.Component {
      
      beforeRender() {}
      
      render(childContent) {}
      
      afterRender() {}
      
      
      beforeDestroy() {}
      
      afterDestroy() {}
      
    }
