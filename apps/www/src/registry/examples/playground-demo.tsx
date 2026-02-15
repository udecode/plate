'use client';

import * as React from 'react';

import { KEYS, NormalizeTypesPlugin } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';

import { useLocale } from '@/hooks/useLocale';
import { getI18nValues } from '@/i18n/getI18nValues';
import { EditorKit } from '@/registry/components/editor/editor-kit';
import { CopilotKit } from '@/registry/components/editor/plugins/copilot-kit';
import { ExcalidrawKit } from '@/registry/components/editor/plugins/excalidraw-kit';
import { Editor, EditorContainer } from '@/registry/ui/editor';

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
        },
      },
      plugins: [
        ...CopilotKit,
        ...EditorKit,
        ...ExcalidrawKit,

        NormalizeTypesPlugin.configure({
          enabled: id === 'forced-layout',
          options: {
            rules: [{ path: [0], strictType: 'h1' }],
          },
        }),
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
