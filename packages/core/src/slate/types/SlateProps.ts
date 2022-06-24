import React from 'react';
import { ReactEditor } from 'slate-react';
import { UnknownObject } from '../../types/misc/AnyObject';
import { TDescendant } from '../node/TDescendant';

export interface SlateProps extends UnknownObject {
  editor: ReactEditor;
  value: TDescendant[];
  children: React.ReactNode;
  onChange: (value: SlateProps['value']) => void;
}
