import React, { useEffect } from 'react';
import { Provider } from 'jotai';
import { Editable, Slate } from 'slate-react';
import { usePlate } from '../hooks/usePlate/usePlate';
import { usePlatesStoreEffect } from '../hooks/usePlatesStoreEffect';
import { Value } from '../slate/editor/TEditor';
import { platesActions, usePlatesSelectors } from '../stores/plate/platesStore';
import { plateIdAtom } from '../stores/plateIdAtom';
import { PlateEditor } from '../types/PlateEditor';
import { PlateStoreState } from '../types/PlateStore';
import { EditorRefEffect } from './EditorRefEffect';
import { EditorStateEffect } from './EditorStateEffect';

export interface PlateProps<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> extends Partial<
    Omit<PlateStoreState<V, E>, 'keyEditor' | 'keyPlugins' | 'keySelection'>
  > {
  /**
   * The children rendered inside `Slate` before the `Editable` component.
   */
  children?: React.ReactNode;

  /**
   * If `true`, disable all the core plugins.
   * If an object, disable the core plugin properties that are `true` in the object.
   */
  disableCorePlugins?:
    | {
        deserializeAst?: boolean;
        deserializeHtml?: boolean;
        eventEditor?: boolean;
        inlineVoid?: boolean;
        insertData?: boolean;
        history?: boolean;
        react?: boolean;
      }
    | boolean;

  /**
   * Initial value of the editor.
   * @default [{ children: [{ text: '' }]}]
   */
  initialValue?: PlateStoreState<V>['value'];

  /**
   * When `true`, it will normalize the initial value passed to the `editor` once it gets created.
   * This is useful when adding normalization rules on already existing content.
   * @default false
   */
  normalizeInitialValue?: boolean;

  /**
   * Custom `Editable` node.
   */
  renderEditable?: (editable: React.ReactNode) => React.ReactNode;
}

export const PlateContent = <
  V extends Value,
  E extends PlateEditor<V> = PlateEditor<V>
>({
  children,
  renderEditable,
  ...options
}: PlateProps<V, E>) => {
  const { slateProps, editableProps } = usePlate<V, E>(options);

  if (!slateProps.editor) return null;

  const editable = <Editable {...(editableProps as any)} />;

  return (
    <Slate {...(slateProps as any)}>
      {children}
      <EditorStateEffect id={options.id} />
      <EditorRefEffect id={options.id} />
      {renderEditable ? renderEditable(editable) : editable}
    </Slate>
  );
};

export const Plate = <
  V extends Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  props: PlateProps<V, E>
) => {
  const { id = 'main', ...state } = props;
  const hasId = usePlatesSelectors.has(id);

  // Clear the state on unmount.
  useEffect(
    () => () => {
      platesActions.unset(id);
    },
    [id]
  );

  // Set initial state on mount
  usePlatesStoreEffect(id, state as any);

  if (!hasId) return null;

  return (
    <Provider initialValues={[[plateIdAtom, id]]}>
      <PlateContent {...props} />
    </Provider>
  );
};
