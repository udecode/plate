import type {
  TEditor,
  TElementEntry,
  Value,
} from '@udecode/plate-common/server';

import { deleteStartSpace } from './deleteStartSpace';

export interface OutdentCodeLineOptions {
  codeBlock: TElementEntry;
  codeLine: TElementEntry;
}

/** Outdent the code line. Remove 2 whitespace characters if any. */
export const outdentCodeLine = <V extends Value>(
  editor: TEditor<V>,
  { codeBlock, codeLine }: OutdentCodeLineOptions
) => {
  const deleted = deleteStartSpace(editor, { codeBlock, codeLine });
  deleted && deleteStartSpace(editor, { codeBlock, codeLine });
};
