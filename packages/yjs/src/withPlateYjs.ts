import type { WithOverride } from '@udecode/plate-common';

import { HocuspocusProvider } from '@hocuspocus/provider';
import {
  type PlateEditor,
  getPluginOptions,
} from '@udecode/plate-common/server';
import * as Y from 'yjs';

import { KEY_YJS, type YjsPluginOptions } from './YjsPlugin';
import { type CursorEditorProps, withTCursors } from './withTCursors';
import { withTYHistory } from './withTYHistory';
import { withTYjs } from './withTYjs';
import { yjsActions } from './yjsStore';

export interface PlateYjsEditorProps extends CursorEditorProps {
  yjs: {
    provider: HocuspocusProvider;
  };
}

export const withPlateYjs: WithOverride<YjsPluginOptions> = ({ editor: e }) => {
  const editor = e as unknown as PlateEditor & PlateYjsEditorProps;

  const {
    cursorOptions,
    disableCursors,
    hocuspocusProviderOptions,
    yjsOptions,
  } = getPluginOptions<YjsPluginOptions>(editor, KEY_YJS);

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
