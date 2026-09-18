import { createPliteEditor } from '#platejs-test-internal';

import {
  createEditor as createHeadlessEditor,
  ElementIdPlugin,
  type EditorApplicationSchema,
  type BasePluginInput,
  type Editor as BaseEditor,
  type InferUpdate,
  type InitialValue,
  type Selection,
  type Value,
} from '../../../../core';
import {
  createEditor,
  type CreateEditorOptions,
  type Editor,
} from '../../../../react/core';
import { BaseTablePlugin, type TableDefinition } from '../BaseTablePlugin';

type TableTestEditor = Editor & {
  update: Editor['update'] & {
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
  createHeadlessEditor({
    ...options,
    editor: createPliteEditor<Value>(),
    plugins: hasPersistedElementId(options.initialValue)
      ? [ElementIdPlugin, ...options.plugins]
      : options.plugins,
  });

export const createTestTableEditor = (
  options: Omit<
    CreateEditorOptions<Value, readonly BasePluginInput[]>,
    'editor' | 'initialValue'
  > & {
    initialValue?: InitialValue<Value>;
  }
): TableTestEditor => {
  const { initialValue, ...rest } = options;
  const plugins: readonly BasePluginInput[] = hasPersistedElementId(
    initialValue
  )
    ? [ElementIdPlugin, ...(rest.plugins ?? [])]
    : (rest.plugins ?? []);

  return createEditor<
    Value,
    readonly BasePluginInput[],
    EditorApplicationSchema | undefined
  >({
    ...rest,
    editor: createPliteEditor<Value>(),
    initialValue: initialValue ?? [
      { children: [{ text: '' }], type: 'paragraph' },
    ],
    plugins,
  }) as unknown as TableTestEditor;
};

export const getTestTablePlugins = (
  options?: Partial<TableDefinition['initialState']>
) => [
  BaseTablePlugin.configure({
    initialState: {
      allowCellSpanEditing: false,
      ...options,
    },
  }),
];
