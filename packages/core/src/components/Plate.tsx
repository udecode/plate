import React, { ForwardedRef, ReactNode, useMemo } from 'react';
import { normalizeEditor, Value } from '@udecode/slate';

import { PLATE_SCOPE, PlateStoreProvider } from '../stores';
import {
  PlateEditor,
  PlatePlugin,
  PlateStoreState,
  TEditableProps,
} from '../types';
import { createPlateEditor, normalizeInitialValue } from '../utils';
import { PlateEffects } from './PlateEffects';

export interface PlateProps<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
> extends Partial<
    Pick<PlateStoreState<V, E>, 'id' | 'editor' | 'value' | 'readOnly'>
  > {
  children: ReactNode;
  decorate?: TEditableProps['decorate'];

  /**
   * If `true`, disable all the core plugins.
   * If an object, disable the core plugin properties that are `true` in the object.
   */
  disableCorePlugins?:
    | {
        deserializeAst?: boolean;
        deserializeHtml?: boolean;
        editorProtocol?: boolean;
        eventEditor?: boolean;
        inlineVoid?: boolean;
        insertData?: boolean;
        history?: boolean;
        nodeFactory?: boolean;
        react?: boolean;
        selection?: boolean;
        length?: boolean;
      }
    | boolean;

  /**
   * Access the editor object using a React ref.
   */
  editorRef?: ForwardedRef<E>;

  /**
   * Initial value of the editor.
   * @default editor.childrenFactory()
   */
  initialValue?: PlateStoreState<V>['value'];

  /**
   * Specifies the maximum number of characters allowed in the editor.
   */
  maxLength?: number;

  /**
   * When `true`, it will normalize the initial value passed to the `editor` once it gets created.
   * This is useful when adding normalization rules on already existing content.
   * @default false
   */
  normalizeInitialValue?: boolean;

  /**
   * Controlled callback called when the editor state changes.
   */
  onChange?: (value: V) => void;

  plugins?: PlatePlugin[];
  renderElement?: TEditableProps['renderElement'];
  renderLeaf?: TEditableProps['renderLeaf'];
}

function PlateInner<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>({
  normalizeInitialValue: shouldNormalizeInitialValue,
  id = PLATE_SCOPE,
  editor: editorProp,
  initialValue,
  value: valueProp,
  children,
  plugins: pluginsProp,
  disableCorePlugins,
  onChange,
  editorRef,
  decorate,
  renderElement,
  renderLeaf,
  readOnly,
  maxLength,
}: PlateProps<V, E>) {
  const editor: E = useMemo(
    () =>
      editorProp ??
      createPlateEditor({
        id,
        plugins: pluginsProp as any,
        disableCorePlugins,
        maxLength,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const value = useMemo(
    () => {
      let currValue = initialValue ?? valueProp;

      if (!currValue) {
        currValue =
          editor.children.length > 0
            ? editor.children
            : (editor.childrenFactory() as V);
      }

      const normalizedValue = normalizeInitialValue(editor, currValue);
      if (normalizedValue) {
        currValue = normalizedValue;
      }

      editor.children = currValue;

      if (shouldNormalizeInitialValue) {
        normalizeEditor(editor, { force: true });
      }

      return editor.children;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <PlateStoreProvider
      id={id}
      editor={editor as any}
      plugins={editor.plugins as any}
      rawPlugins={pluginsProp}
      readOnly={readOnly}
      value={value}
      decorate={decorate}
      onChange={onChange as PlateStoreState['onChange']}
      editorRef={editorRef as PlateStoreState['editorRef']}
      renderElement={renderElement}
      renderLeaf={renderLeaf}
      scope={id}
    >
      <PlateEffects
        id={id}
        disableCorePlugins={disableCorePlugins}
        plugins={pluginsProp}
      >
        {children}
      </PlateEffects>
    </PlateStoreProvider>
  );
}

export function Plate<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(props: PlateProps<V, E>) {
  const { id } = props;

  return <PlateInner key={id?.toString()} {...props} />;
}
