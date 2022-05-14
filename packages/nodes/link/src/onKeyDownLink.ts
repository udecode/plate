import {
  KeyboardHandlerReturnType,
  PlateEditor,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { getAndUpsertLink } from './transforms';
import { LinkPlugin } from './types';

export const onKeyDownLink = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  { options: { getLinkUrl, hotkey } }: WithPlatePlugin<LinkPlugin, V, E>
): KeyboardHandlerReturnType => (e) => {
  if (!hotkey) return;

  if (isHotkey(hotkey, e as any)) {
    e.preventDefault();
    e.stopPropagation();

    getAndUpsertLink(editor, getLinkUrl);
  }
};
