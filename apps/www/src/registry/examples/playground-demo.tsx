'use client';

import * as React from 'react';

import { CopilotPlugin } from '@platejs/ai/react';
import { IndentPlugin } from '@platejs/indent/react';
import { ListPlugin } from '@platejs/list/react';
import { NormalizeTypesPlugin } from 'platejs';
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
  const value = React.useMemo(() => getI18nValues(locale).playground, [locale]);

  const editor = usePlateEditor(
    {
      plugins: [
        ...CopilotKit,
        ...EditorKit,
        ...ExcalidrawKit,
        ...(id === 'copilot'
          ? []
          : [CopilotPlugin.configure({ enabled: false })]),
        ...(id === 'listClassic'
          ? [
              IndentPlugin.configure({ enabled: false }),
              ListPlugin.configure({ enabled: false }),
            ]
          : []),

        NormalizeTypesPlugin.configure({
          enabled: id === 'forced-layout',
          initialState: {
            rules: [{ path: [0], strictType: 'h1' }],
          },
        }),
      ],
      initialValue: value,
    },
    [id, locale]
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
