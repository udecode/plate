import React from 'react';

import { type Value, normalizeEditor } from '@udecode/slate';
import { nanoid } from 'nanoid/non-secure';

import type {
  PlateEditor,
  PlatePlugin,
  PlateStoreState,
  TEditableProps,
} from '../../shared/types';

import { normalizeInitialValue } from '../../shared';
import { PlateStoreProvider } from '../stores';
import { createPlateEditor } from '../utils';
import { PlateEffects } from './PlateEffects';

export interface PlateProps<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
> extends Partial<
    Pick<
      PlateStoreState<V, E>,
      'editor' | 'id' | 'primary' | 'readOnly' | 'value'
    >
  > {
  children: React.ReactNode;
  decorate?: TEditableProps['decorate'];

  /**
   * If `true`, disable all the core plugins. If an object, disable the core
   * plugin properties that are `true` in the object.
   */
  disableCorePlugins?:
    | {
        deserializeAst?: boolean;
        deserializeHtml?: boolean;
        editorProtocol?: boolean;
        eventEditor?: boolean;
        history?: boolean;
        inlineVoid?: boolean;
        insertData?: boolean;
        length?: boolean;
        nodeFactory?: boolean;
        react?: boolean;
        selection?: boolean;
      }
    | boolean;

  /** Access the editor object using a React ref. */
  editorRef?: React.ForwardedRef<E>;

  /**
   * Initial value of the editor.
   *
   * @default editor.childrenFactory()
   */
  initialValue?: PlateStoreState<V>['value'];

  /** Specifies the maximum number of characters allowed in the editor. */
  maxLength?: number;

  /**
   * When `true`, it will normalize the initial value passed to the `editor`
   * once it gets created. This is useful when adding normalization rules on
   * already existing content.
   *
   * @default false
   */
  normalizeInitialValue?: boolean;

  /** Controlled callback called when the editor state changes. */
  onChange?: (value: V) => void;

  plugins?: PlatePlugin[];
  renderElement?: TEditableProps['renderElement'];
  renderLeaf?: TEditableProps['renderLeaf'];
}

function PlateInner<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>({
  children,
  decorate,
  disableCorePlugins,
  editor: editorProp,
  editorRef,
  id: idProp,
  initialValue,
  maxLength,
  normalizeInitialValue: shouldNormalizeInitialValue,
  onChange,
  plugins: pluginsProp,
  primary,
  readOnly,
  renderElement,
  renderLeaf,
  value: valueProp,
}: PlateProps<V, E>) {
  const [id] = React.useState(() => editorProp?.id ?? idProp ?? nanoid());

  const editor: E = React.useMemo(
    () =>
      editorProp ??
      createPlateEditor({
        disableCorePlugins,
        id,
        maxLength,
        plugins: pluginsProp as any,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const value = React.useMemo(
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
      decorate={decorate}
      editor={editor as any}
      editorRef={editorRef as PlateStoreState['editorRef']}
      id={id}
      onChange={onChange as PlateStoreState['onChange']}
      plugins={editor.plugins as any}
      primary={primary}
      rawPlugins={pluginsProp}
      readOnly={readOnly}
      renderElement={renderElement}
      renderLeaf={renderLeaf}
      scope={id}
      value={value}
    >
      <PlateEffects
        disableCorePlugins={disableCorePlugins}
        id={id}
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
