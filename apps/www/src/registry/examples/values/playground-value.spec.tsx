import { describe, expect, it } from 'bun:test';

import { createEditor } from 'platejs/react';
import { CalloutPlugin } from 'platejs/callout/react';
import { CodeDrawingPlugin } from 'platejs/code-drawing/react';

import { playgroundValue } from './playground-value';

describe('playgroundValue', () => {
  it('matches its required persisted-node plugins', () => {
    const editor = createEditor({
      plugins: [CalloutPlugin, CodeDrawingPlugin],
      initialValue: {
        ...playgroundValue,
        children: playgroundValue.children.filter(
          (node) => node.type === 'callout' || node.type === 'codeDrawing'
        ),
      },
    });

    expect(
      editor.read.children().find((node) => node.type === 'callout')
    ).toMatchObject({ icon: '💡', variant: 'info' });
    expect(
      editor.read.children().some((node) => node.type === 'codeDrawing')
    ).toBe(true);
  });

  it('is deterministic and already satisfies the trailing-block invariant', () => {
    expect(JSON.stringify(playgroundValue)).toContain('1704067200000');
    expect(playgroundValue.children.at(-1)).toEqual({
      children: [{ text: '' }],
      type: 'paragraph',
    });
  });
});
