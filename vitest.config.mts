import { defineConfig } from 'vitest/config';

export default defineConfig({
  // tsconfig keeps JSX as-is for Next to compile; the tests need it compiled.
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    unstubEnvs: true,
  },
});
