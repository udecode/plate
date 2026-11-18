'use client';

import { CheckIcon, PenLineIcon } from 'lucide-react';
import { EditorRoot, useCreateEditor } from 'platejs/react';

import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { SlashCombobox, SlashPlugin } from '@/registry/components/editor/slash';

export default function SlashCommandItemsDemo() {
  const editor = useCreateEditor({
    plugins: [
      ...BasicBlocksKit,
      SlashPlugin.configure({
        initialState: {
          items: [
            {
              group: 'Basic blocks',
              icon: () => <PenLineIcon />,
              isAvailable: () => true,
              keywords: ['sign'],
              label: 'Signature',
              onSelect: (_editor, tx) => {
                tx.text.insert('Signed by the review team.');
              },
            },
            {
              group: 'Team',
              icon: () => <CheckIcon />,
              isAvailable: () => true,
              label: 'Approval stamp',
              onSelect: (_editor, tx) => {
                tx.text.insert('Approved.');
              },
            },
          ],
        },
        slots: { afterEditable: SlashCombobox },
      }),
    ],
    initialValue: [
      {
        children: [
          {
            text: 'Type / and pick Signature or Approval stamp. Both come from the app, not from the copied slash file.',
          },
        ],
        type: 'paragraph',
      },
      { children: [{ text: '' }], type: 'paragraph' },
    ],
  });

  return (
    <EditorRoot editor={editor}>
      <EditorFrame className="h-[320px]">
        <EditorContainer>
          <Editor />
        </EditorContainer>
      </EditorFrame>
    </EditorRoot>
  );
}
