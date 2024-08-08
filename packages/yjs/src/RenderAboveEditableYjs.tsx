import React from 'react';

import type { PlateEditor } from '@udecode/plate-common/server';

import { YjsEditor } from '@slate-yjs/core';
import { useEditorRef } from '@udecode/plate-common';

import type { PlateYjsEditorProps } from './withPlateYjs';

import { useYjsSelectors } from './yjsStore';

export const RenderAboveEditableYjs: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const editor = useEditorRef<PlateEditor & PlateYjsEditorProps>();

  const isSynced = useYjsSelectors.isSynced();

  React.useEffect(() => {
    void editor.yjs.provider.connect();

    return () => editor.yjs.provider.disconnect();
  }, [editor.yjs.provider]);

  React.useEffect(() => {
    YjsEditor.connect(editor as any);

    return () => YjsEditor.disconnect(editor as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.yjs.provider.awareness, editor.yjs.provider.document]);

  if (!isSynced) return null;

  return <>{children}</>;
};
