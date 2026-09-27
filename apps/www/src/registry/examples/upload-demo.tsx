'use client';

import { BaseImagePlugin } from 'platejs/media';
import { createEditor, EditorRoot, ParagraphPlugin } from 'platejs/react';
import * as React from 'react';

import { DndKit } from '@/registry/components/editor/dnd';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { MediaKit } from '@/registry/components/editor/media';
import { MediaToolbarButton } from '@/registry/components/editor/media-toolbar-button';
import { ParagraphElement } from '@/registry/components/editor/paragraph';
import { Toolbar } from '@/registry/components/editor/toolbar';
import { UploadKit } from '@/registry/components/editor/upload';
import { createBrowserUploadKit } from '@/registry/components/editor/upload/browser';

export default function UploadDemo({
  provider = 'r2',
}: {
  provider?: 'browser' | 'r2';
}) {
  const [delayMs, setDelayMs] = React.useState(0);
  const session = React.useMemo(() => {
    const browserUploads =
      provider === 'browser' ? createBrowserUploadKit() : null;
    const editor = createEditor({
      plugins: [
        ParagraphPlugin.configure({ component: ParagraphElement }),
        ...DndKit,
        ...MediaKit,
        ...UploadKit,
        ...(browserUploads?.plugins ?? []),
      ],
      initialValue: [
        {
          children: [
            {
              text: 'Choose an image, or drop or paste a file into the editor.',
            },
          ],
          type: 'paragraph',
        },
      ],
    });

    return { browserUploads, editor };
  }, [provider]);

  React.useEffect(() => session.browserUploads?.dispose, [session]);
  React.useEffect(() => {
    session.browserUploads?.setSimulatedDelayMs(delayMs);
  }, [delayMs, session]);

  return (
    <>
      {provider === 'browser' && (
        <label className="flex items-center gap-3 px-4 py-2 text-sm">
          <span>Simulated upload time</span>
          <input
            className="w-40 accent-primary"
            max={5000}
            min={0}
            onChange={(event) => setDelayMs(Number(event.target.value))}
            step={500}
            type="range"
            value={delayMs}
          />
          <output>{delayMs === 0 ? 'Instant' : `${delayMs / 1000}s`}</output>
        </label>
      )}
      <EditorRoot editor={session.editor}>
        <EditorFrame>
          <Toolbar>
            <MediaToolbarButton plugin={BaseImagePlugin} />
          </Toolbar>
          <EditorContainer>
            <Editor placeholder="Drop or paste files here..." />
          </EditorContainer>
        </EditorFrame>
      </EditorRoot>
    </>
  );
}
