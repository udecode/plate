import React from 'react';
import { TDescendant, UnknownObject } from '@udecode/slate';
import { ReactEditor } from 'slate-react';

export interface SlateProps extends UnknownObject {
  editor: ReactEditor;
  value: TDescendant[];
  children: React.ReactNode;
  onChange: (value: SlateProps['value']) => void;
}
