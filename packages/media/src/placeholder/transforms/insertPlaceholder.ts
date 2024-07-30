import {
  type InsertNodesOptions,
  type PlateEditor,
  type Value,
  insertNodes,
  withoutNormalizing,
} from '@udecode/plate-common';

import type { TPlaceholderElement } from '../types';

import { ELEMENT_AUDIO } from '../../audio';
import { ELEMENT_FILE } from '../../file';
import { ELEMENT_IMAGE } from '../../image';
import { ELEMENT_VIDEO } from '../../video';
import { ELEMENT_PLACEHOLDER } from '../PlaceholderPlugin';

export const insertPlaceHolder = <V extends Value>(
  editor: PlateEditor<V>,
  mediaType: string,
  options?: InsertNodesOptions<V>
) => {
  withoutNormalizing(editor, () =>
    insertNodes<TPlaceholderElement>(
      editor,
      {
        children: [{ text: '' }],
        mediaType,
        type: ELEMENT_PLACEHOLDER,
      },
      options as any
    )
  );
};

export const insertImagePlaceholder = <V extends Value>(
  editor: PlateEditor<V>,
  options?: InsertNodesOptions<V>
) => insertPlaceHolder(editor, ELEMENT_IMAGE, options);

export const insertVideoPlaceholder = <V extends Value>(
  editor: PlateEditor<V>,
  options?: InsertNodesOptions<V>
) => insertPlaceHolder(editor, ELEMENT_VIDEO, options);

export const insertAudioPlaceholer = <V extends Value>(
  editor: PlateEditor<V>,
  options?: InsertNodesOptions<V>
) => insertPlaceHolder(editor, ELEMENT_AUDIO, options);

export const insertFilePlaceholer = <V extends Value>(
  editor: PlateEditor<V>,
  options?: InsertNodesOptions<V>
) => insertPlaceHolder(editor, ELEMENT_FILE, options);
