import { loadTrace } from '../../../../config/vitest-load-trace.mjs';

export default {
  plugins: [loadTrace()],
  test: { globals: true, include: ['*.fixture.ts'], root: import.meta.dirname },
};
