'use client';

import { createPlateUI } from '@/plate/create-plate-ui';
import { createBasicElementsPlugin } from '@udecode/plate-basic-elements';
import { createBasicMarksPlugin } from '@udecode/plate-basic-marks';
import { createPlugins, Plate } from '@udecode/plate-common';

import { Label } from '@/components/ui/label';
import { Editor } from '@/registry/default/plate-ui/editor';
import { FloatingToolbar } from '@/registry/default/plate-ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/registry/default/plate-ui/floating-toolbar-buttons';

export default function EditorText() {
  const plugins = createPlugins(
    [createBasicElementsPlugin(), createBasicMarksPlugin()],
    { components: createPlateUI() }
  );

  return (
    <div className="mt-[72px] grid gap-1.5 p-10">
      <Plate plugins={plugins}>
        <Label htmlFor="message-2">Your Message</Label>
        <Editor placeholder="Type your message here." id="message-2" />

        <FloatingToolbar>
          <FloatingToolbarButtons />
        </FloatingToolbar>

        <p className="text-sm text-muted-foreground">
          Your message will be copied to the support team.
        </p>
      </Plate>
    </div>
  );
}
