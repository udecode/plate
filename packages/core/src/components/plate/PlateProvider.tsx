import React, { FC, useMemo } from 'react';
import { normalizeEditor, Value } from '../../slate/index';
import { PLATE_SCOPE, plateStore } from '../../stores/index';
import {
  ELEMENT_DEFAULT,
  PlateEditor,
  PlateStoreState,
} from '../../types/index';
import {
  createPlateEditor,
  getPluginType,
  normalizeInitialValue,
} from '../../utils/index';
import { JotaiProvider } from '../../utils/misc/jotai';
import { withHOC } from '../../utils/react/withHOC';
import {
  PlateProviderEffects,
  PlateProviderEffectsProps,
} from './PlateProviderEffects';

export interface PlateProviderProps<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> extends PlateProviderEffectsProps<V, E>,
    Partial<Pick<PlateStoreState<V, E>, 'id' | 'editor'>> {
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
}

export const PlateProvider = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>({
  normalizeInitialValue: shouldNormalizeInitialValue,
  ...props
}: PlateProviderProps<V, E>) => {
  const {
    id = PLATE_SCOPE,
    editor: _editor,
    initialValue,
    value: _value,
    children,
    plugins,
    disableCorePlugins,
    onChange,
    decorate,
    renderElement,
    renderLeaf,
  } = props;

  const editor: E = useMemo(
    () => {
      return (
        _editor ??
        createPlateEditor({
          id,
          plugins: plugins as any,
          disableCorePlugins,
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const value = useMemo(
    () => {
      let currValue =
        initialValue ??
        _value ??
        ([
          {
            type: getPluginType(editor, ELEMENT_DEFAULT),
            children: [{ text: '' }],
          },
        ] as V);

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
        [plateStore.atom.value, value],
        [plateStore.atom.decorate, { fn: decorate }],
        [plateStore.atom.onChange, { fn: onChange }],
        [plateStore.atom.renderElement, { fn: renderElement }],
        [plateStore.atom.renderLeaf, { fn: renderLeaf }],
      ]}
      scope={id}
    >
      <PlateProviderEffects {...props}>{children}</PlateProviderEffects>
    </JotaiProvider>
  );
};

export const withPlateProvider = <T,>(Component: FC<T>, hocProps?: T) =>
  withHOC<T>(PlateProvider, Component, hocProps);
