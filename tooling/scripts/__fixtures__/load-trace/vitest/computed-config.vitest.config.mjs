import path from 'node:path';

const { loadTrace } = await import(
  path.join(
    import.meta.dirname,
    '../../../../config/vitest-load-' + 'trace.mjs'
  )
);

export default {
  plugins: [loadTrace()],
  test: {
    globals: true,
    include: ['computed.fixture.ts'],
    root: import.meta.dirname,
  },
};
