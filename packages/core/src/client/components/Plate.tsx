import React from 'react';

import { type Value, normalizeEditor } from '@udecode/slate';

import type {
  PlateEditor,
  PlateStoreState,
  TEditableProps,
} from '../../shared/types';

import { pipeNormalizeInitialValue } from '../../shared';
import { PlateStoreProvider } from '../stores';
import { PlateEffects } from './PlateEffects';

export interface PlateProps<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
> extends Partial<
    Pick<
      PlateStoreState<V, E>,
      | 'decorate'
      | 'onChange'
      | 'onSelectionChange'
      | 'onValueChange'
      | 'primary'
      | 'readOnly'
      | 'value'
    >
  > {
  children: React.ReactNode;

  editor: E;

  /**
   * Initial value of the editor.
   *
   * @default editor.childrenFactory()
   */
  initialValue?: PlateStoreState<V>['value'];

  renderElement?: TEditableProps['renderElement'];

  renderLeaf?: TEditableProps['renderLeaf'];

  /**
   * When `true`, it will normalize the initial `value` passed to the `editor`.
   * This is useful when adding normalization rules on already existing
   * content.
   *
   * @default false
   */
  shouldNormalizeEditor?: boolean;
}

function PlateInner({
  children,
  decorate,
  editor,
  initialValue,
  onChange,
  onSelectionChange,
  onValueChange,
  primary,
  readOnly,
  renderElement,
  renderLeaf,
  shouldNormalizeEditor,
  value: valueProp,
}: PlateProps) {
  // const editor = React.useMemo(
  //   () =>
  //     editorProp
  // ??
  // createPlateEditor({
  //   disableCorePlugins,
  //   id,
  //   maxLength,
  //   plugins: pluginsProp as any,
  //   ...rootPluginOptions,
  // }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  //   []
  // );

  const value = React.useMemo(
    () => {
      editor.children = initialValue ?? valueProp ?? editor.children;

      if (editor.children?.length === 0) {
        editor.children = editor.childrenFactory();
      }
      if (initialValue || valueProp) {
        pipeNormalizeInitialValue(editor);
      }
      if (shouldNormalizeEditor) {
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
      onChange={onChange as PlateStoreState['onChange']}
      onSelectionChange={
        onSelectionChange as PlateStoreState['onSelectionChange']
      }
      onValueChange={onValueChange as PlateStoreState['onValueChange']}
      primary={primary}
      readOnly={readOnly}
      renderElement={renderElement}
      renderLeaf={renderLeaf}
      scope={editor.id}
      value={value}
    >
      <PlateEffects>{children}</PlateEffects>
    </PlateStoreProvider>
  );
}

export function Plate<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(props: PlateProps<V, E>) {
  return <PlateInner key={props.editor.id?.toString()} {...(props as any)} />;
}
