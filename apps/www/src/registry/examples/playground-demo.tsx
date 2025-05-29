'use client';

import * as React from 'react';

import { KEYS, NormalizeTypesPlugin } from '@udecode/plate';
import { PlaywrightPlugin } from '@udecode/plate-playwright';
import { Plate, usePlateEditor, useStoreValue } from '@udecode/plate/react';

import { SettingsStore } from '@/components/context/settings-store';
import { useLocale } from '@/hooks/useLocale';
import { getI18nValues } from '@/i18n/getI18nValues';
import { EditorKit } from '@/registry/components/editor/editor-kit';
import { CopilotKit } from '@/registry/components/editor/plugins/copilot-kit';
import { Editor, EditorContainer } from '@/registry/ui/editor';

export default function PlaygroundDemo({ className }: { className?: string }) {
  const enabled = usePlaygroundEnabled();

  const locale = useLocale();
  const value = getI18nValues(locale).playground;

  const editor = usePlateEditor(
    {
      override: { enabled },
      plugins: [
        ...CopilotKit,
        ...EditorKit,

        NormalizeTypesPlugin.configure({
          options: {
            rules: [{ path: [0], strictType: 'h1' }],
          },
        }),

        // Testing
        PlaywrightPlugin.configure({
          enabled: process.env.NODE_ENV !== 'production',
        }),
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

function usePlaygroundEnabled(id?: string) {
  const enabled = useStoreValue(SettingsStore, 'checkedPlugins');

  return React.useMemo(
    () => ({
      [KEYS.aiChat]: id === 'ai' || !!enabled[KEYS.aiChat],
      [KEYS.autoformat]: !!enabled.autoformat,
      [KEYS.backgroundColor]: !!enabled.backgroundColor,
      [KEYS.blockquote]: !!enabled.blockquote,
      [KEYS.blockSelection]:
        id === 'block-selection' || !!enabled.blockSelection,
      [KEYS.bold]: !!enabled.bold,
      [KEYS.caption]: !!enabled.caption,
      [KEYS.code]: !!enabled.code,
      [KEYS.codeBlock]: !!enabled.code_block,
      [KEYS.color]: !!enabled.color,
      [KEYS.column]: !!enabled.column,
      [KEYS.comment]: !!enabled.comment,
      [KEYS.copilot]: id === 'copilot' || !!enabled[KEYS.copilot],
      [KEYS.cursorOverlay]: !!enabled.cursorOverlay,
      [KEYS.delete]: !!enabled.delete,
      [KEYS.dnd]: !!enabled.dnd,
      [KEYS.docx]: !!enabled.docx,
      [KEYS.emoji]: !!enabled.emoji,
      [KEYS.excalidraw]: !!enabled.excalidraw,
      [KEYS.exitBreak]: !!enabled.exitBreak,
      [KEYS.fontSize]: !!enabled.fontSize,
      [KEYS.h1]: !!enabled.heading,
      [KEYS.highlight]: !!enabled.highlight,
      [KEYS.hr]: !!enabled.hr,
      [KEYS.img]: !!enabled.img,
      [KEYS.indent]: id !== 'listClassic' && !!enabled.indent,
      [KEYS.italic]: !!enabled.italic,
      [KEYS.juice]: !!enabled.juice,
      [KEYS.kbd]: !!enabled.kbd,
      [KEYS.lineHeight]: !!enabled.lineHeight,
      [KEYS.link]: !!enabled.a,
      [KEYS.list]: id === 'list' || !!enabled.list,
      [KEYS.listClassic]: id === 'listClassic' && !!enabled.listClassic,
      [KEYS.listTodoClassic]: !!enabled.action_item,
      [KEYS.markdown]: !!enabled.markdown,
      [KEYS.mediaEmbed]: !!enabled.media_embed,
      [KEYS.mention]: !!enabled.mention,
      [KEYS.normalizeTypes]: !!enabled.normalizeTypes,
      [KEYS.p]: !!enabled.p,
      [KEYS.resetNode]: !!enabled.resetNode,
      [KEYS.selectOnBackspace]: !!enabled.selectOnBackspace,
      [KEYS.singleLine]: id === 'single-line' || !!enabled.singleLine,
      [KEYS.softBreak]: !!enabled.softBreak,
      [KEYS.strikethrough]: !!enabled.strikethrough,
      [KEYS.sub]: !!enabled.subscript,
      [KEYS.sup]: !!enabled.superscript,
      [KEYS.tabbable]: !!enabled.tabbable,
      [KEYS.table]: !!enabled.table,
      [KEYS.textAlign]: !!enabled.textAlign,
      [KEYS.toggle]: !!enabled.toggle,
      [KEYS.trailingBlock]: id !== 'single-line' && !!enabled.trailingBlock,
      [KEYS.underline]: !!enabled.underline,
    }),
    [enabled, id]
  );
}
