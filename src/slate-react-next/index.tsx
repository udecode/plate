import {
  Editable as SlateEditable,
  EditableType,
  Slate as SlateCore,
  SlateType,
} from 'slate-react';

export const Slate = SlateCore as SlateType;
export const Editable = SlateEditable as EditableType;
