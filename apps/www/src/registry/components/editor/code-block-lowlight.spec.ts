import { expect, it } from 'bun:test';

import { createCodeBlockLowlight } from './code-block-lowlight';

it('registers browser-safe Python and its aliases before syntax reads', () => {
  const lowlight = createCodeBlockLowlight();

  for (const language of ['python', 'py', 'gyp', 'ipython']) {
    expect(lowlight.registered(language)).toBe(true);
    expect(
      JSON.stringify(lowlight.highlight(language, 'def hello():\n    return 1'))
    ).toContain('hljs-keyword');
  }
});
