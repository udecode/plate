import React, { useEffect } from 'react';
import { Editable, Slate } from 'slate-react';
import { usePlate } from '../hooks/usePlate/usePlate';
import { platesActions, usePlatesSelectors } from '../stores/plate/platesStore';
import { PlateStoreState } from '../types/PlateStore';
import { SlateProps } from '../types/slate/SlateProps';
import { EditorRefEffect } from './EditorRefEffect';
import { EditorStateEffect } from './EditorStateEffect';

export interface PlateProps<T = {}>
  extends Partial<
    Omit<PlateStoreState<T>, 'keyEditor' | 'keyPlugins' | 'keySelection'>
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
  initialValue?: PlateStoreState['value'];

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

export const PlateContent = <T extends {} = {}>({
  children,
  renderEditable,
  ...options
}: PlateProps<T>) => {
  const { slateProps, editableProps } = usePlate(options);

  if (!slateProps.editor) return null;

  const editable = <Editable {...editableProps} />;

  return (
    <Slate {...(slateProps as SlateProps)}>
      {children}
      <EditorStateEffect id={options.id} />
      <EditorRefEffect id={options.id} />
      {renderEditable ? renderEditable(editable) : editable}
    </Slate>
  );
};

export const Plate = <T extends {} = {}>(props: PlateProps<T>) => {
  const { id = 'main' } = props;
  const isReady = usePlatesSelectors.has(id);

  // Clear the state on unmount.
  useEffect(
    () => () => {
      platesActions.unset(id);
    },
    [id]
  );

  // Set initial state on mount
  useEffect(() => {
    platesActions.set(id);
  }, [id]);

  if (!isReady) return null;

  return <PlateContent {...props} />;
};
