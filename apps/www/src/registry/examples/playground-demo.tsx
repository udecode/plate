'use client';

import * as React from 'react';

import { PlaywrightPlugin } from '@platejs/playwright';
import { KEYS, NormalizeTypesPlugin } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';

import { useLocale } from '@/hooks/useLocale';
import { getI18nValues } from '@/i18n/getI18nValues';
import { EditorKit } from '@/registry/components/editor/editor-kit';
import { CopilotKit } from '@/registry/components/editor/plugins/copilot-kit';
import { Editor, EditorContainer } from '@/registry/ui/editor';
import { basicBlocksValue } from './values/basic-blocks-value';
import { listValue } from './values/list-value';

export default function PlaygroundDemo({
  id,
  className,
}: {
  id?: string;
  className?: string;
}) {
  const locale = useLocale();
  const value = getI18nValues(locale).basicBlocks;

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
      value: [...basicBlocksValue, ...listValue],
    },
    []
  );

  return (
    <Plate
      onValueChange={(v) => {
        console.log('🚀 ~ PlaygroundDemo ~ v:', v.value);
      }}
      editor={editor}
    >
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
