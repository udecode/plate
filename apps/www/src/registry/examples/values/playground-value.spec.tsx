import { describe, expect, it } from 'bun:test';

import { CodeBlockPlugin, createEditor } from 'platejs/react';
import { CalloutPlugin } from 'platejs/callout/react';

import { playgroundValue } from './playground-value';

describe('playgroundValue', () => {
  it('matches its required persisted-node plugins', () => {
    const editor = createEditor({
      plugins: [CalloutPlugin, CodeBlockPlugin],
      initialValue: {
        ...playgroundValue,
        children: playgroundValue.children.filter(
          (node) => node.type === 'callout' || node.type === 'codeBlock'
        ),
      },
    });

    expect(
      editor.read.children().find((node) => node.type === 'callout')
    ).toMatchObject({ icon: '💡', variant: 'info' });
    expect(
      editor.read
        .children()
        .some(
          (node) => node.type === 'codeBlock' && node.language === 'mermaid'
        )
    ).toBe(true);
  });

  it('already satisfies the trailing-block invariant', () => {
    expect(playgroundValue.children.at(-1)).toEqual({
      children: [{ text: '' }],
      type: 'paragraph',
    });
  });
});
