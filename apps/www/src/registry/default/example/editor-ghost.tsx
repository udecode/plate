'use client';

import { createBasicElementsPlugin } from '@udecode/plate-basic-elements';
import { createBasicMarksPlugin } from '@udecode/plate-basic-marks';
import { Plate, createPlugins } from '@udecode/plate-common';

import { createPlateUI } from '@/plate/create-plate-ui';
import { Editor } from '@/registry/default/plate-ui/editor';
import { FloatingToolbar } from '@/registry/default/plate-ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/registry/default/plate-ui/floating-toolbar-buttons';

export default function EditorGhost() {
  const plugins = createPlugins(
    [createBasicElementsPlugin(), createBasicMarksPlugin()],
    { components: createPlateUI() }
  );

  return (
    <div className="mt-[72px] p-10">
      <Plate plugins={plugins}>
        <Editor placeholder="Type your message here." variant="ghost" />

        <FloatingToolbar>
          <FloatingToolbarButtons />
        </FloatingToolbar>
      </Plate>
    </div>
  );
}
