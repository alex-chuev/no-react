import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const resolve = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {find: /^no-react\/jsx-(dev-)?runtime$/, replacement: resolve('./jsx-runtime.ts')},
      {find: /^no-react$/, replacement: resolve('./index.ts')},
    ],
  },
  test: {
    environment: 'jsdom',
  },
});
