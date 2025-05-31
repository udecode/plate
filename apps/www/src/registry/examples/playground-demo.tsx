'use client';

import * as React from 'react';

import { KEYS, NormalizeTypesPlugin } from '@udecode/plate';
import { PlaywrightPlugin } from '@udecode/plate-playwright';
import { Plate, usePlateEditor } from '@udecode/plate/react';

import { useLocale } from '@/hooks/useLocale';
import { getI18nValues } from '@/i18n/getI18nValues';
import { EditorKit } from '@/registry/components/editor/editor-kit';
import { CopilotKit } from '@/registry/components/editor/plugins/copilot-kit';
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
          [KEYS.playwright]: process.env.NODE_ENV !== 'production',
          [KEYS.singleLine]: id === 'single-line',
          [KEYS.trailingBlock]: id !== 'single-line',
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
        <Editor variant="demo" className="pb-[20vh]" spellCheck={false} />
      </EditorContainer>
    </Plate>
  );
}
