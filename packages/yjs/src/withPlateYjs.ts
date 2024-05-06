import { HocuspocusProvider } from '@hocuspocus/provider';
import {
  type PlateEditor,
  type UnknownObject,
  type Value,
  getPluginOptions,
} from '@udecode/plate-common/server';
import * as Y from 'yjs';

import { KEY_YJS, type YjsPlugin } from './createYjsPlugin';
import { type CursorEditorProps, withTCursors } from './withTCursors';
import { withTYHistory } from './withTYHistory';
import { withTYjs } from './withTYjs';
import { yjsActions } from './yjsStore';

export interface PlateYjsEditorProps extends CursorEditorProps {
  yjs: {
    provider: HocuspocusProvider;
  };
}

export const withPlateYjs = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
  EE extends E & PlateYjsEditorProps = E & PlateYjsEditorProps,
  TCursorData extends UnknownObject = UnknownObject,
>(
  e: E
) => {
  const editor = e as unknown as EE;

  const {
    cursorOptions,
    disableCursors,
    hocuspocusProviderOptions,
    yjsOptions,
  } = getPluginOptions<YjsPlugin<TCursorData>, V, E>(editor, KEY_YJS);

  if (!hocuspocusProviderOptions) {
    throw new Error('HocuspocusProvider configuration is required');
  }

  /**
   * Create a new websocket-provider instance. As long as this provider, or the
   * connected ydoc, is not destroyed, the changes will be synced to other
   * clients via the connected server.
   */
  const provider = new HocuspocusProvider({
    ...hocuspocusProviderOptions,
    onAwarenessChange() {},
    onConnect() {
      yjsActions.isConnected(true);
      hocuspocusProviderOptions.onConnect?.();
    },
    onDisconnect(data) {
      yjsActions.isConnected(false);
      yjsActions.isSynced(false);
      hocuspocusProviderOptions.onDisconnect?.(data);
    },
    onSynced(data) {
      yjsActions.isSynced(true);
      hocuspocusProviderOptions.onSynced?.(data);
    },
  });

  editor.yjs = {
    provider: provider as any,
  };

  const sharedType = provider.document.get(
    'content',
    Y.XmlText
  ) as any as Y.XmlText;

  if (disableCursors) {
    return withTYHistory(
      withTYjs<V, EE, EE>(editor, sharedType, {
        autoConnect: false,
        ...yjsOptions,
      })
    ) as EE;
  }

  return withTYHistory(
    withTCursors<TCursorData, V, EE, EE>(
      withTYjs<V, EE, EE>(editor, sharedType, {
        autoConnect: false,
        ...yjsOptions,
      }),
      provider.awareness!,
      cursorOptions
    )
  ) as EE;
};
