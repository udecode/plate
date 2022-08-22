import React, { Ref, useEffect } from 'react';
import { Slate } from 'slate-react';
import { plateIdAtom, SCOPE_PLATE } from '../../atoms/plateIdAtom';
import { usePlate } from '../../hooks/plate/usePlate';
import { usePlatesStoreEffect } from '../../hooks/plate/usePlatesStoreEffect';
import { Value } from '../../slate/editor/TEditor';
import {
  platesActions,
  usePlatesSelectors,
} from '../../stores/plate/platesStore';
import { PlateEditor } from '../../types/plate/PlateEditor';
import { PlateStoreState } from '../../types/plate/PlateStore';
import { JotaiProvider, Scope } from '../../utils/misc/jotai';
import { SlateChildren } from './SlateChildren';

export interface PlateProps<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> extends Partial<
    Omit<PlateStoreState<V, E>, 'keyEditor' | 'keyPlugins' | 'keySelection'>
  > {
  /**
   * The children rendered inside `Slate`, after `Editable`.
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
        selection?: boolean;
      }
    | boolean;

  /**
   * Ref to the `Editable` component.
   */
  editableRef?: Ref<HTMLDivElement>;

  /**
   * The first children rendered inside `Slate`, before `Editable`.
   * Slate DOM is not yet resolvable on first render, for that case use `children` instead.
   */
  firstChildren?: React.ReactNode;

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

  scope?: Scope;
}

export const PlateContent = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>({
  children,
  editableRef,
  firstChildren,
  renderEditable,
  ...options
}: PlateProps<V, E>) => {
  const { slateProps, editableProps } = usePlate<V, E>(options);

  const editor = slateProps.editor as E | undefined;

  if (!editor) return null;

  return (
    <Slate {...(slateProps as any)}>
      <SlateChildren<V, E>
        editor={editor}
        editableProps={editableProps}
        editableRef={editableRef}
        firstChildren={firstChildren}
        renderEditable={renderEditable}
      >
        {children}
      </SlateChildren>
    </Slate>
  );
};

export const Plate = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  props: PlateProps<V, E>
) => {
  const { id = 'main', scope = SCOPE_PLATE, ...state } = props;
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
    <JotaiProvider initialValues={[[plateIdAtom, id]]} scope={scope}>
      <PlateContent {...props} />
    </JotaiProvider>
  );
};
