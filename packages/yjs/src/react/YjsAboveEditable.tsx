import React from 'react';

import { YjsEditor } from '@slate-yjs/core';
import { useEditorPlugin, usePluginOption } from '@udecode/plate/react';

import { type YjsConfig, BaseYjsPlugin } from '../lib/BaseYjsPlugin';

export const YjsAboveEditable: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { editor } = useEditorPlugin<YjsConfig>(BaseYjsPlugin);

  const provider = usePluginOption(BaseYjsPlugin, 'provider');
  const isSynced = usePluginOption(BaseYjsPlugin, 'isSynced');

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
