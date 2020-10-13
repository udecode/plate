import * as React from 'react';
import { Node } from 'slate';
import { ReactEditor } from 'slate-react';

export interface SlateProps {
  [key: string]: unknown;
  editor: ReactEditor;
  value: Node[];
  children: React.ReactNode;
  onChange: (value: Node[]) => void;
}
