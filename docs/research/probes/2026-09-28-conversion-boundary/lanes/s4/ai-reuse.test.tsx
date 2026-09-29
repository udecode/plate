// Lane S4: does the S5 `previous` hint reach the AI preview? Streams twelve
// paragraphs through useAIChat into AIChatPlugin.setPreview and counts how many
// leading blocks of each published preview are the same objects as in the
// preview before it. Writes ai-reuse.json next to this file.
// Run from the repository root:
//   bun test docs/research/probes/2026-09-28-conversion-boundary/lanes/s4/ai-reuse.test.tsx
import { expect, test } from 'bun:test';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { act, render } from '@testing-library/react';
import type { ChatTransport, UIMessage, UIMessageChunk } from 'ai';
import React from 'react';

import { AIChatPlugin } from '../../../../../../packages/platejs/src/ai/react/AIChatPlugin';
import { useAIChat } from '../../../../../../packages/platejs/src/ai/react/useAIChat';
import {
  createEditor,
  EditorRoot,
  ParagraphPlugin,
} from '../../../../../../packages/platejs/src/react/core';

test('AI preview reuse across publications', async () => {
  let stream!: ReadableStreamDefaultController<UIMessageChunk>;
  let ready!: () => void;
  const started = new Promise<void>((resolve) => {
    ready = resolve;
  });
  const transport: ChatTransport<UIMessage> = {
    reconnectToStream: async () => null,
    sendMessages: async () =>
      new ReadableStream({
        start: (controller) => {
          stream = controller;
          ready();
        },
      }),
  };
  const editor = createEditor({
    plugins: [ParagraphPlugin, AIChatPlugin],
    initialValue: [{ type: 'paragraph', children: [{ text: 'original' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 8 },
      focus: { path: [0, 0], offset: 8 },
    },
  });
  function Binding() {
    const editableRef = React.useRef<HTMLDivElement>(null);
    useAIChat({ editableRef, transport });
    return <div ref={editableRef} />;
  }
  const view = render(
    <EditorRoot editor={editor}>
      <Binding />
    </EditorRoot>
  );
  const drafts: unknown[][] = [];
  const unsubscribe = editor
    .plugin(AIChatPlugin)
    .store.subscribe((state, previous) => {
      if (
        state.previewValue !== previous.previewValue &&
        state.previewValue.length > 0
      ) {
        drafts.push([...state.previewValue]);
      }
    });

  try {
    await act(async () => {
      editor.plugin(AIChatPlugin).api.submit('go', { mode: 'insert' });
    });
    await started;
    await act(async () => {
      stream.enqueue({ type: 'start', messageId: 'a' });
      stream.enqueue({ type: 'text-start', id: 't' });
    });
    for (let index = 0; index < 12; index++) {
      await act(async () => {
        stream.enqueue({
          type: 'text-delta',
          id: 't',
          delta: `Paragraph ${index} text.\n\n`,
        });
      });
      await act(
        () =>
          new Promise<void>((resolve) => {
            setTimeout(resolve, 40);
          })
      );
    }
    let reused = 0;
    let possible = 0;

    for (let index = 1; index < drafts.length; index++) {
      possible += drafts[index - 1].length - 1;
      reused += drafts[index].filter(
        (node, at) => node === drafts[index - 1][at]
      ).length;
    }
    expect(drafts.length).toBeGreaterThan(1);
    writeFileSync(
      path.join(import.meta.dir, 'ai-reuse.json'),
      `${JSON.stringify({ possible, previews: drafts.length, reused }, null, 2)}\n`
    );
    console.log(
      `AI previews ${drafts.length}: ${reused} of at most ${possible} earlier blocks reused`
    );
  } finally {
    unsubscribe();
    view.unmount();
  }
});
