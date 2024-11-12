import React, { useId } from 'react';

import type { TEditableProps } from '@udecode/slate-react';

import type { PlateEditor } from '../editor/PlateEditor';

import { usePlateInstancesWarn } from '../../internal/usePlateInstancesWarn';
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

  suppressInstanceWarning?: boolean;
}

function PlateInner({
  children,
  containerRef,
  decorate,
  editor,
  primary,
  readOnly,
  renderElement,
  renderLeaf,
  onChange,
  onSelectionChange,
  onValueChange,
}: PlateProps & { containerRef: React.RefObject<HTMLDivElement> }) {
  return (
    <PlateStoreProvider
      readOnly={readOnly}
      onChange={onChange}
      onSelectionChange={onSelectionChange}
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
  );
}

export function Plate<E extends PlateEditor = PlateEditor>(
  props: PlateProps<E>
) {
  const id = useId();

  const containerRef = React.useRef<HTMLDivElement>(null);

  usePlateInstancesWarn(props.suppressInstanceWarning);

  if (!props.editor) return null;

  props.editor.uid = 'e-' + id.replace(/:/g, '');

  return (
    <PlateInner
      key={props.editor.key}
      containerRef={containerRef}
      {...(props as any)}
    />
  );
}
