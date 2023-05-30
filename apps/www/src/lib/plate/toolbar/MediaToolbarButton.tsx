import React from 'react';
import { ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED } from '@udecode/plate';
import { focusEditor, usePlateEditorRef } from '@udecode/plate-common';

import { Icons } from '@/components/icons';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import { insertMedia } from '@/lib/@/insertMedia';

export function MediaToolbarButton({
  nodeType,
}: {
  nodeType?: typeof ELEMENT_IMAGE | typeof ELEMENT_MEDIA_EMBED;
}) {
  const editor = usePlateEditorRef();

  return (
    <ToolbarButton
      onClick={async () => {
        await insertMedia(editor, { type: nodeType });
        focusEditor(editor);
      }}
    >
      <Icons.image />
    </ToolbarButton>
  );
}
