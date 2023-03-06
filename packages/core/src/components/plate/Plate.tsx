import React from 'react';
import { Value } from '@udecode/slate';
import { PLATE_SCOPE, usePlateSelectors } from '../../stores/index';
import { PlateEditor } from '../../types/plate/PlateEditor';
import { TEditableProps } from '../../types/TEditableProps';
import { PlateEditable, PlateEditableExtendedProps } from './PlateEditable';
import { PlateProvider, PlateProviderProps } from './PlateProvider';
import { PlateSlate } from './PlateSlate';

export interface PlateProps<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> extends Omit<PlateProviderProps<V, E>, 'children'>,
    PlateEditableExtendedProps {
  editableProps?: TEditableProps<V>;
}

export const Plate = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>({
  children,
  editableRef,
  firstChildren,
  renderEditable,
  editableProps,
  ...props
}: PlateProps<V, E>) => {
  const { id = PLATE_SCOPE } = props;

  const providerId = usePlateSelectors(id).id();

  const editable = (
    <PlateSlate id={id}>
      <PlateEditable
        id={id}
        editableRef={editableRef}
        firstChildren={firstChildren}
        renderEditable={renderEditable}
        {...editableProps}
      >
        {children}
      </PlateEditable>
    </PlateSlate>
  );

  return providerId ? (
    editable
  ) : (
    <PlateProvider {...props}>{editable}</PlateProvider>
  );
};
