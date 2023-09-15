import React, { FC, useMemo } from 'react';
import { normalizeEditor, Value } from '@udecode/slate';

import { JotaiProvider } from '../libs/jotai';
import {
  GLOBAL_PLATE_SCOPE,
  PLATE_SCOPE,
  plateIdAtom,
  plateStore,
} from '../stores';
import { PlateEditor, PlateStoreState } from '../types';
import { createPlateEditor, normalizeInitialValue, withHOC } from '../utils';
import { PlateEffects, PlateEffectsProps } from './PlateEffects';
import { PlateSlate } from './PlateSlate';

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
}

function PlateContent<
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
  } = props;

  const editor: E = useMemo(
    () =>
      editorProp ??
      createPlateEditor({
        id,
        plugins: pluginsProp as any,
        disableCorePlugins,
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
    <JotaiProvider
      initialValues={[
        [plateStore.atom.id, id],
        [plateStore.atom.editor, editor],
        [plateStore.atom.plugins, editor.plugins],
        [plateStore.atom.rawPlugins, pluginsProp],
        [plateStore.atom.readOnly, readOnly],
        [plateStore.atom.value, value],
        [plateStore.atom.decorate, { fn: decorate }],
        [plateStore.atom.onChange, { fn: onChange }],
        [plateStore.atom.editorRef, { ref: editorRef }],
        [plateStore.atom.renderElement, { fn: renderElement }],
        [plateStore.atom.renderLeaf, { fn: renderLeaf }],
      ]}
      scope={id}
    >
      <JotaiProvider
        initialValues={[[plateIdAtom, id]]}
        scope={GLOBAL_PLATE_SCOPE}
      >
        <PlateEffects {...props}>
          <PlateSlate id={id}>{children}</PlateSlate>
        </PlateEffects>
      </JotaiProvider>
    </JotaiProvider>
  );
}

export function Plate<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(props: PlateProps<V, E>) {
  const { id } = props;

  return <PlateContent key={id?.toString()} {...props} />;
}

export const withPlateProvider = <T,>(Component: FC<T>, hocProps?: T) =>
  withHOC<T>(Plate, Component, hocProps);
