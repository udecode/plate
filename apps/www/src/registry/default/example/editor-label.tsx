'use client';

import { BasicElementsPlugin } from '@udecode/plate-basic-elements/react';
import { BasicMarksPlugin } from '@udecode/plate-basic-marks/react';
import { Plate, usePlateEditor } from '@udecode/plate-common/react';

import { Label } from '@/components/ui/label';
import { PlateUI } from '@/plate/demo/plate-ui';
import { Editor } from '@/registry/default/plate-ui/editor';
import { FloatingToolbar } from '@/registry/default/plate-ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/registry/default/plate-ui/floating-toolbar-buttons';

export default function EditorLabel() {
  const editor = usePlateEditor({
    id: 'message',
    override: { components: PlateUI },
    plugins: [BasicElementsPlugin, BasicMarksPlugin],
  });

  return (
    <div className="mt-[72px] grid gap-1.5 p-10">
      <Plate editor={editor}>
        <Label htmlFor="message">Your message</Label>
        <Editor id="message" placeholder="Type your message here." />

        <FloatingToolbar>
          <FloatingToolbarButtons />
        </FloatingToolbar>
      </Plate>
    </div>
  );
}
