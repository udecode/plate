import type { SlateEditor } from '@platejs/core';
import type { Value } from '@platejs/slate';

import {
  createPlateRuntimeEditor,
  type CreatePlateRuntimeEditorOptions,
} from '../../../../core/src/react/editor/createPlateRuntimeEditor';

type RuntimePluginInput<
  V extends Value,
  TExtensions extends readonly unknown[],
> = NonNullable<
  CreatePlateRuntimeEditorOptions<V, TExtensions>['plugins']
>[number];

type ListClassicRuntimeTestEditorOptions<
  V extends Value,
  TExtensions extends readonly unknown[],
  P extends RuntimePluginInput<V, TExtensions>,
> = Omit<
  CreatePlateRuntimeEditorOptions<V, TExtensions, P>,
  'initialSelection' | 'initialValue'
> & {
  selection?: CreatePlateRuntimeEditorOptions<
    V,
    TExtensions,
    P
  >['initialSelection'];
  value?: V;
};

export const createListClassicRuntimeTestEditor = <
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
  const P extends RuntimePluginInput<V, TExtensions> = RuntimePluginInput<
    V,
    TExtensions
  >,
>({
  selection,
  value,
  ...options
}: ListClassicRuntimeTestEditorOptions<V, TExtensions, P> = {}) =>
  createPlateRuntimeEditor<V, TExtensions, P>({
    ...options,
    initialSelection: selection,
    initialValue: value,
  }) as unknown as SlateEditor;
