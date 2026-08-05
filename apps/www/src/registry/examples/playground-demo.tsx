'use client';

import * as React from 'react';

import { CopilotPlugin } from '@platejs/ai/react';
import { IndentPlugin } from '@platejs/indent/react';
import { ListPlugin } from '@platejs/list/react';
import { NormalizeTypesPlugin, normalizeStaticValue } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';

import { useLocale } from '@/hooks/useLocale';
import { getI18nValues } from '@/i18n/getI18nValues';
import { EditorKit } from '@/registry/components/editor/editor-kit';
import { CopilotKit } from '@/registry/components/editor/plugins/copilot-kit';
import { ExcalidrawKit } from '@/registry/components/editor/plugins/excalidraw-kit';
import { Editor, EditorContainer } from '@/registry/ui/editor';

const basePlugins = [
  ...CopilotKit,
  ...EditorKit,
  ...ExcalidrawKit,
  PlaywrightPlugin,
];

export default function PlaygroundDemo({
  id,
  className,
}: {
  id?: string;
  className?: string;
}) {
  const locale = useLocale();
  const value = React.useMemo(
    () => normalizeStaticValue(getI18nValues(locale).playground),
    [locale]
  );

  const plugins = React.useMemo(() => {
    if (id !== 'forced-layout') return basePlugins;

    return [
      ...basePlugins,
      NormalizeTypesPlugin.configure({
        options: {
          rules: [{ path: [0], strictType: 'h1' }],
        },
      }),
    ];
  }, [id]);

  const overrideEnabled = React.useMemo(
    () => ({
      [KEYS.copilot]: id === 'copilot',
      [KEYS.indent]: id !== 'listClassic',
      [KEYS.list]: id !== 'listClassic',
      [KEYS.listClassic]: id === 'listClassic',
      [KEYS.playwright]: process.env.NODE_ENV !== 'production',
    }),
    [id]
  );

  const editor = usePlateEditor(
    {
      override: {
        enabled: overrideEnabled,
      },
      plugins,
      value,
    },
    [id, locale, overrideEnabled, plugins]
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
