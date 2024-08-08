'use client';

import { BasicElementsPlugin } from '@udecode/plate-basic-elements';
import { BasicMarksPlugin } from '@udecode/plate-basic-marks';
import { Plate, usePlateEditor } from '@udecode/plate-common';

import { PlateUI } from '@/plate/demo/plate-ui';
import { Editor } from '@/registry/default/plate-ui/editor';
import { FloatingToolbar } from '@/registry/default/plate-ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/registry/default/plate-ui/floating-toolbar-buttons';

export default function EditorGhost() {
  const editor = usePlateEditor({
    override: { components: PlateUI },
    plugins: [BasicElementsPlugin, BasicMarksPlugin],
  });

  return (
    <div className="mt-[72px] p-10">
      <Plate editor={editor}>
        <Editor placeholder="Type your message here." variant="ghost" />

        <FloatingToolbar>
          <FloatingToolbarButtons />
        </FloatingToolbar>
      </Plate>
    </div>
  );
}
