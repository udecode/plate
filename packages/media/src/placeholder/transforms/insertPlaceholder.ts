import {
  type InsertNodesOptions,
  type PlateEditor,
  insertNodes,
  withoutNormalizing,
} from '@udecode/plate-common';

import type { TPlaceholderElement } from '../types';

import { ELEMENT_AUDIO } from '../../audio';
import { ELEMENT_FILE } from '../../file';
import { ELEMENT_IMAGE } from '../../image';
import { ELEMENT_VIDEO } from '../../video';
import { ELEMENT_PLACEHOLDER } from '../PlaceholderPlugin';

export const insertPlaceHolder = <E extends PlateEditor>(
  editor: E,
  mediaType: string,
  options?: InsertNodesOptions<E>
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

export const insertImagePlaceholder = <E extends PlateEditor>(
  editor: E,
  options?: InsertNodesOptions<E>
) => insertPlaceHolder(editor, ELEMENT_IMAGE, options);

export const insertVideoPlaceholder = <E extends PlateEditor>(
  editor: E,
  options?: InsertNodesOptions<E>
) => insertPlaceHolder(editor, ELEMENT_VIDEO, options);

export const insertAudioPlaceholer = <E extends PlateEditor>(
  editor: E,
  options?: InsertNodesOptions<E>
) => insertPlaceHolder(editor, ELEMENT_AUDIO, options);

export const insertFilePlaceholer = <E extends PlateEditor>(
  editor: E,
  options?: InsertNodesOptions<E>
) => insertPlaceHolder(editor, ELEMENT_FILE, options);
