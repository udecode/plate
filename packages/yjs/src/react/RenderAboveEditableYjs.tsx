import React from 'react';

import { YjsEditor } from '@slate-yjs/core';
import { type PlateEditor, useEditorRef } from '@udecode/plate-common/react';

import type { YjsConfig } from '../lib/YjsPlugin';
import type { PlateYjsEditorProps } from '../lib/withTCursors';

import { useYjsSelectors } from '../lib/yjsStore';

export const RenderAboveEditableYjs: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const editor = useEditorRef<PlateEditor & PlateYjsEditorProps>();
  const { provider } = editor.getOptions<YjsConfig>({ key: 'yjs' });

  const isSynced = useYjsSelectors.isSynced();

  React.useEffect(() => {
    void provider.connect();

    return () => provider.disconnect();
  }, [provider]);

  React.useEffect(() => {
    YjsEditor.connect(editor as any);

    return () => YjsEditor.disconnect(editor as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider.awareness, provider.document]);

  if (!isSynced) return null;

  return <>{children}</>;
};
