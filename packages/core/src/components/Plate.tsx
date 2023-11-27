import React, { useMemo } from 'react';
import { normalizeEditor, Value } from '@udecode/slate';

import {
  PLATE_SCOPE,
  PlateStoreProvider,
} from '../stores';
import { PlateEditor, PlateStoreState } from '../types';
import { createPlateEditor, normalizeInitialValue } from '../utils';
import { PlateEffects, PlateEffectsProps } from './PlateEffects';

export interface PlateProps<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
> extends PlateEffectsProps<V, E>,
    Partial<Pick<PlateStoreState<V, E>, 'id' | 'editor'>> {
  /**
   * Initial value of the editor.
   * @default editor.childrenFactory()
   */
  initialValue?: PlateStoreState<V>['value'];

  /**
   * When `true`, it will normalize the initial value passed to the `editor` once it gets created.
   * This is useful when adding normalization rules on already existing content.
   * @default false
   */
  normalizeInitialValue?: boolean;

  /**
   * Specifies the maximum number of characters allowed in the editor.
   */
  maxLength?: number;
}

function PlateInner<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>({
  normalizeInitialValue: shouldNormalizeInitialValue,
  ...props
}: PlateProps<V, E>) {
  const {
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
  } = props;

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
      decorate={{ fn: decorate as any }}
      onChange={{ fn: onChange as any }}
      editorRef={{ ref: editorRef as any }}
      renderElement={{ fn: renderElement as any }}
      renderLeaf={{ fn: renderLeaf as any }}
      scope={id}
    >
      <PlateEffects {...props}>{children}</PlateEffects>
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
