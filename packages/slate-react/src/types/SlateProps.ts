import type React from 'react';

import type { TDescendant } from '@udecode/slate';
import type { UnknownObject } from '@udecode/utils';
import type { ReactEditor } from 'slate-react';

export interface SlateProps extends UnknownObject {
  children: React.ReactNode;
  editor: ReactEditor;
  initialValue: TDescendant[];
  onChange?: (value: TDescendant[]) => void;
  onSelectionChange?: (selection: Selection) => void;
  onValueChange?: (value: TDescendant[]) => void;
}
