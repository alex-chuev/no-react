import * as NoReact from './lib/api';

export * from './lib/api';

/**
 * The whole API as a single object, for `import NoReact from 'no-react'` and the
 * classic JSX transform (`"jsxFactory": "NoReact.createElement"`).
 */
export default NoReact;
