import React from 'react';

import { YjsEditor } from '@slate-yjs/core';
import { useEditorPlugin } from '@udecode/plate-common/react';

import { type YjsConfig, BaseYjsPlugin } from '../lib/BaseYjsPlugin';
import { RemoteCursorOverlay } from './Overlay';

export const YjsAboveEditable: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { editor, useOption } = useEditorPlugin<YjsConfig>(BaseYjsPlugin);

  const provider = useOption('provider');
  const isSynced = useOption('isSynced');

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

  return <RemoteCursorOverlay>{children}</RemoteCursorOverlay>;
};
