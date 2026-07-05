import React from 'react';

import { EditorReadOnlyProvider } from '@platejs/plite-react';

import type { EditableProps } from '../../lib/types/EditableProps';
import type { PlateEditor } from '../editor/PlateEditor';

import { usePlateInstancesWarn } from '../../internal/hooks/usePlateInstancesWarn';
import { getPlateEditorInstanceKey } from '../internal/getPlateEditorInstanceKey';
import { type PlateStoreState, PlateStoreProvider } from '../stores';

export interface PlateProps<E extends PlateEditor = PlateEditor>
  extends Partial<
    Pick<
      PlateStoreState<E>,
      | 'decorate'
      | 'onChange'
      | 'onNodeChange'
      | 'onSelectionChange'
      | 'onTextChange'
      | 'onValueChange'
      | 'primary'
    >
  > {
  children: React.ReactNode;

  editor: E | null;

  readOnly?: boolean;

  renderElement?: EditableProps['renderElement'];

  renderLeaf?: EditableProps['renderLeaf'];

  suppressInstanceWarning?: boolean;
}

function PlateInner<E extends PlateEditor = PlateEditor>({
  children,
  containerRef,
  decorate,
  editor,
  primary,
  readOnly,
  renderElement,
  renderLeaf,
  onChange,
  onNodeChange,
  onSelectionChange,
  onTextChange,
  onValueChange,
}: PlateProps<E> & {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const plateReadOnly = readOnly ?? editor?.read.view.isReadOnly();

  return (
    <EditorReadOnlyProvider readOnly={plateReadOnly}>
      <PlateStoreProvider
        onChange={onChange}
        onNodeChange={onNodeChange}
        onSelectionChange={onSelectionChange}
        onTextChange={onTextChange}
        onValueChange={onValueChange}
        containerRef={containerRef}
        decorate={decorate}
        editor={editor!}
        primary={primary}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        scope={editor!.id}
      >
        {children}
      </PlateStoreProvider>
    </EditorReadOnlyProvider>
  );
}

export function Plate<E extends PlateEditor = PlateEditor>(
  props: PlateProps<E>
) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  usePlateInstancesWarn(props.suppressInstanceWarning);

  if (!props.editor) return null;

  return (
    <PlateInner<E>
      key={getPlateEditorInstanceKey(props.editor)}
      containerRef={containerRef}
      {...props}
    />
  );
}
