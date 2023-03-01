import React from 'react';
import { ReactEditor } from 'slate-react';
import { TDescendant } from '../../../slate-utils/src/slate/node/TDescendant';
import { UnknownObject } from '../../../slate-utils/src/types/misc/AnyObject';

export interface SlateProps extends UnknownObject {
  editor: ReactEditor;
  value: TDescendant[];
  children: React.ReactNode;
  onChange: (value: SlateProps['value']) => void;
}
