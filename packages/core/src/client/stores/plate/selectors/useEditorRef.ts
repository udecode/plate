import type { Value } from '@udecode/slate';

import type { PlateEditor } from '../../../../shared/types';

import {
  type PlateId,
  type UsePlateEditorStoreOptions,
  usePlateSelectors,
} from '../createPlateStore';

/** Get editor ref which is never updated. */
export const useEditorRef = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  id?: PlateId,
  options: UsePlateEditorStoreOptions = {}
): E =>
  usePlateSelectors(id, {
    debugHookName: 'useEditorRef',
    ...options,
  }).editor() as any;
