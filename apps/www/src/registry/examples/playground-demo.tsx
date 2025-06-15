'use client';

import * as React from 'react';

import { PlaywrightPlugin } from '@platejs/playwright';
import {
  type DOMRange,
  IS_CHROME,
  KEYS,
  NormalizeTypesPlugin,
  RangeApi,
} from 'platejs';
import { type PlateEditor, Plate, usePlateEditor } from 'platejs/react';
import scrollIntoView from 'scroll-into-view-if-needed';

import { useLocale } from '@/hooks/useLocale';
import { getI18nValues } from '@/i18n/getI18nValues';
import { EditorKit } from '@/registry/components/editor/editor-kit';
import { CopilotKit } from '@/registry/components/editor/plugins/copilot-kit';
import { Editor, EditorContainer } from '@/registry/ui/editor';

const defaultScrollSelectionIntoView = (
  editor: PlateEditor,
  domRange: DOMRange
) => {
  const scroll = () => {
    console.log('--- Debugging scrollIntoView (SIMPLE) ---');

    const { selection } = editor;
    if (!selection) {
      console.log('[skip] deferred scroll skipped, no selection.');
      return;
    }

    try {
      const domRange = editor.api.toDOMRange(selection)!;
      const leafEl = domRange.startContainer.parentElement;

      if (!leafEl) {
        console.log('[error] could not find leafEl');
        return;
      }

      console.log('[info] scrolling leafEl into view:', leafEl);
      scrollIntoView(leafEl, { scrollMode: 'if-needed' });

      console.log(
        '[end] simple scrollIntoView finished at',
        new Date().toLocaleTimeString()
      );
    } catch (error) {
      console.error(
        '[error] Could not calculate DOM range for scrolling:',
        error
      );
    }
  };

  if (IS_CHROME) {
    requestAnimationFrame(scroll);
    return;
  }

  // This was affecting the selection of multiple blocks and dragging behavior,
  // so enabled only if the selection has been collapsed.
  if (
    domRange.getBoundingClientRect &&
    (!editor.selection ||
      (editor.selection && RangeApi.isCollapsed(editor.selection)))
  ) {
    const leafEl = domRange.startContainer.parentElement!;
    leafEl.getBoundingClientRect =
      domRange.getBoundingClientRect.bind(domRange);
    scrollIntoView(leafEl, {
      scrollMode: 'if-needed',
    });

    // @ts-expect-error an unorthodox delete D:
    delete leafEl.getBoundingClientRect;
  }
};

export default function PlaygroundDemo({
  id,
  className,
}: {
  id?: string;
  className?: string;
}) {
  const locale = useLocale();
  const value = getI18nValues(locale).playground;

  const editor = usePlateEditor(
    {
      override: {
        enabled: {
          [KEYS.copilot]: id === 'copilot',
          [KEYS.indent]: id !== 'listClassic',
          [KEYS.list]: id !== 'listClassic',
          [KEYS.listClassic]: id === 'listClassic',
          [KEYS.playwright]: process.env.NODE_ENV !== 'production',
        },
      },
      plugins: [
        ...CopilotKit,
        ...EditorKit,

        NormalizeTypesPlugin.configure({
          enabled: id === 'forced-layout',
          options: {
            rules: [{ path: [0], strictType: 'h1' }],
          },
        }),

        // Testing
        PlaywrightPlugin,
      ],
      value,
    },
    []
  );

  return (
    <Plate editor={editor}>
      <EditorContainer className={className}>
        <Editor
          variant="demo"
          className="pb-[20vh]"
          placeholder="Type something..."
          spellCheck={false}
        />
      </EditorContainer>
    </Plate>
  );
}
