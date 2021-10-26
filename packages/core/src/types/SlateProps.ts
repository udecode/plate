import React from 'react';
import { ReactEditor } from 'slate-react';
import { TDescendant } from './TDescendant';

export interface SlateProps {
  [key: string]: unknown;
  editor: ReactEditor;
  value: TDescendant[];
  children: React.ReactNode;
  onChange: (value: SlateProps['value']) => void;
}
