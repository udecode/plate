'use client';

import * as React from 'react';

import { SingleBlockPlugin, SingleLinePlugin } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { EditorKit } from '@/registry/components/editor/editor-kit';
import { Editor, EditorContainer } from '@/registry/ui/editor';

export default function SingleBlockDemo() {
  const [isSingleBlock, setIsSingleBlock] = React.useState(true);

  const editor = usePlateEditor(
    {
      plugins: [
        ...EditorKit,
        isSingleBlock ? SingleBlockPlugin : SingleLinePlugin,
      ],
      value: [
        {
          children: [
            {
              text: `Try typing or pasting text with multiple lines. ${
                isSingleBlock
                  ? String.raw`With Single Block mode, line breaks become soft breaks (\n).`
                  : 'With Single Line mode, all line breaks are removed.'
              }`,
            },
          ],
          type: 'p',
        },
      ],
    },
    [isSingleBlock]
  );

  return (
    <div className="space-y-4">
      <Plate editor={editor}>
        <div className="flex items-center space-x-2 p-2">
          <Checkbox
            id="single-block-mode"
            checked={isSingleBlock}
            onCheckedChange={(checked) =>
              setIsSingleBlock(checked === 'indeterminate' ? false : checked)
            }
          />
          <Label htmlFor="single-block-mode">
            {String.raw`Single Block Mode (allows line breaks as \n)`}
          </Label>
        </div>

        <EditorContainer variant="demo">
          <Editor />
        </EditorContainer>
      </Plate>
    </div>
  );
}
