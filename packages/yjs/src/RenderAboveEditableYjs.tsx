import React, { FC, ReactNode, useEffect } from 'react';
import { YjsEditor } from '@slate-yjs/core';
import { PlateEditor, Value, usePlateEditorRef } from '@udecode/plate-common';

import { PlateYjsEditorProps } from './withPlateYjs';
import { useYjsSelectors } from './yjsStore';

export const RenderAboveEditableYjs: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const editor = usePlateEditorRef<Value, PlateEditor & PlateYjsEditorProps>();

  const isSynced = useYjsSelectors.isSynced();

  useEffect(() => {
    editor.yjs.provider.connect();
    return () => editor.yjs.provider.disconnect();
  }, [editor.yjs.provider]);

  useEffect(() => {
    YjsEditor.connect(editor as any);
    return () => YjsEditor.disconnect(editor as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.yjs.provider.awareness, editor.yjs.provider.document]);

  if (!isSynced) return null;

  return <>{children}</>;
};
