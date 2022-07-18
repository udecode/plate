import { useEffect } from 'react';
import { YjsEditor } from '@slate-yjs/core';
import { Value } from '@udecode/plate';
import { PlateYjsEditor } from './withPlateYjs';

export const useHooksYjs = <
  V extends Value = Value,
  E extends PlateYjsEditor<V> = PlateYjsEditor<V>
>(
  editor: E
) => {
  // Disconnect YjsEditor on unmount in order to free up resources
  useEffect(() => {
    editor.yjs.provider.connect();
    return () => editor.yjs.provider.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.yjs.provider]);

  useEffect(() => {
    YjsEditor.connect(editor as any);
    return () => YjsEditor.disconnect(editor as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.yjs.provider.awareness, editor.yjs.provider.document]);
};
