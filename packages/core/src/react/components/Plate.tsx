import React from 'react';

import type { TEditableProps } from '@udecode/slate-react';

import type { PlateEditor } from '../editor/PlateEditor';

import { type PlateStoreState, PlateStoreProvider } from '../stores';

export interface PlateProps<E extends PlateEditor = PlateEditor>
  extends Partial<
    Pick<
      PlateStoreState<E>,
      | 'decorate'
      | 'onChange'
      | 'onSelectionChange'
      | 'onValueChange'
      | 'primary'
      | 'readOnly'
    >
  > {
  children: React.ReactNode;

  editor: E | null;

  renderElement?: TEditableProps['renderElement'];

  renderLeaf?: TEditableProps['renderLeaf'];
}

function PlateInner({
  children,
  decorate,
  editor,
  primary,
  readOnly,
  renderElement,
  renderLeaf,
  onChange,
  onSelectionChange,
  onValueChange,
}: PlateProps) {
  return (
    <PlateStoreProvider
      readOnly={readOnly}
      onChange={onChange}
      onSelectionChange={onSelectionChange}
      onValueChange={onValueChange}
      decorate={decorate}
      editor={editor!}
      primary={primary}
      renderElement={renderElement}
      renderLeaf={renderLeaf}
      scope={editor!.id}
    >
      {children}
    </PlateStoreProvider>
  );
}

export function Plate<E extends PlateEditor = PlateEditor>(
  props: PlateProps<E>
) {
  if (!props.editor) return null;

  return <PlateInner key={props.editor.key} {...(props as any)} />;
}
