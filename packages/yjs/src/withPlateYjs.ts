import type { PlateEditor, WithOverride } from '@udecode/plate-common';

import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';

import type { YjsPluginOptions } from './YjsPlugin';

import { type PlateYjsEditorProps, withTCursors } from './withTCursors';
import { withTYHistory } from './withTYHistory';
import { withTYjs } from './withTYjs';
import { yjsActions } from './yjsStore';

export const withPlateYjs: WithOverride<YjsPluginOptions> = ({
  editor: e,
  plugin,
}) => {
  const editor = e as unknown as PlateEditor & PlateYjsEditorProps;

  const {
    cursorOptions,
    disableCursors,
    hocuspocusProviderOptions,
    yjsOptions,
  } = plugin.options;

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
      withTYjs(editor, sharedType, {
        autoConnect: false,
        ...yjsOptions,
      })
    );
  }

  return withTYHistory(
    withTCursors(
      withTYjs(editor, sharedType, {
        autoConnect: false,
        ...yjsOptions,
      }),
      provider.awareness!,
      cursorOptions
    )
  );
};
