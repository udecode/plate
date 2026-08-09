import {
  createBaseEditor,
  ElementIdPlugin,
  type BaseEditor,
  type BasePluginInput,
  type InferUpdate,
} from '@platejs/core';
import {
  createPlateEditor,
  type CreatePlateEditorOptions,
  type PlateEditor,
} from '@platejs/core/react';
import {
  createEditor,
  type InitialValue,
  type Selection,
  type Value,
} from '@platejs/plite';

import { BaseTablePlugin, type TableDefinition } from '../BaseTablePlugin';

type TableTestEditor = PlateEditor & {
  update: PlateEditor['update'] & {
    table: InferUpdate<TableDefinition>;
  };
};

type BaseTableTestEditorOptions = {
  initialValue: InitialValue<Value>;
  plugins: readonly BasePluginInput[];
  selection?: Selection;
};

const hasPersistedElementId = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') return false;
  if (!Array.isArray(value) && typeof Reflect.get(value, 'id') === 'string') {
    return true;
  }

  return Object.values(value).some(hasPersistedElementId);
};

/** Runtime-fixture boundary for tests that intentionally use broad/custom ASTs. */
export const createTestBaseTableEditor = (
  options: BaseTableTestEditorOptions
): BaseEditor =>
  (
    createBaseEditor as unknown as (
      options: BaseTableTestEditorOptions & {
        editor: ReturnType<typeof createEditor>;
      }
    ) => BaseEditor
  )({
    ...options,
    editor: createEditor<Value>(),
    plugins: hasPersistedElementId(options.initialValue)
      ? [ElementIdPlugin, ...options.plugins]
      : options.plugins,
  });

export const createTestTableEditor = (
  options: Omit<
    CreatePlateEditorOptions<readonly BasePluginInput[]>,
    'editor' | 'initialValue'
  > & {
    initialValue?: InitialValue<Value>;
  }
): TableTestEditor => {
  const { initialValue, ...rest } = options;

  return createPlateEditor({
    ...rest,
    editor: createEditor<Value>(),
    initialValue: initialValue ?? [
      { children: [{ text: '' }], type: 'paragraph' },
    ],
    plugins: hasPersistedElementId(initialValue)
      ? [ElementIdPlugin, ...(rest.plugins ?? [])]
      : rest.plugins,
  }) as unknown as TableTestEditor;
};

export const getTestTablePlugins = (
  options?: Partial<TableDefinition['initialState']>
) => [
  BaseTablePlugin.configure({
    initialState: {
      disableMerge: true,
      ...options,
    },
  }),
];
