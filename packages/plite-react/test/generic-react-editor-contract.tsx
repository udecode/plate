import {
  createEditor,
  type CompatibleEditorCommand,
  defineCommand,
  defineExtension,
  defineEditorSchema,
  editorCommands,
  type EditorCommit,
  type EditorCommandDescriptor,
  type EditorCommandInput,
  type EditorValueFromExtensions,
  type Node as PliteNode,
  property,
  schema,
  type ValueOf,
} from '@platejs/plite';
import { dom } from '@platejs/plite-dom';
import { history } from '@platejs/plite-history';
import * as PliteReact from '@platejs/plite-react';
import {
  createReactEditor,
  Editable,
  type EditableProps,
  type EditorSelectorOptions,
  Plite,
  type ReactEditor,
  react,
  type StateFieldSetter,
  useEditorSelector,
  usePliteEditor,
  usePliteHistory,
  usePliteCommand,
  usePliteRootChrome,
  usePliteRootEditor,
  usePliteRootState,
} from '@platejs/plite-react';

type CustomText = {
  text: string;
  bold?: true;
};

type ParagraphElement = {
  type: 'paragraph';
  children: CustomText[];
};

type LinkElement = {
  type: 'link';
  url: string;
  children: CustomText[];
};

type CustomElement = ParagraphElement | LinkElement;

type CustomValue = CustomElement[];

type ExpectFalse<T extends false> = T;
type EditableHasDOMStrategyLayout =
  'domStrategyLayout' extends keyof EditableProps ? true : false;
type EditableHidesDOMStrategyLayout = ExpectFalse<EditableHasDOMStrategyLayout>;

const initialValue: CustomValue = [
  { type: 'paragraph', children: [{ text: 'initial', bold: true }] },
];

declare const dataTransfer: DataTransfer;
declare const pliteNode: PliteNode;

const ReactExtension = react({ dom: dom() });
const _reactExtensionName: 'react' = ReactExtension.name;
// @ts-expect-error react requires an exact DOM descriptor
const _invalidZeroArgumentReact = react();
// @ts-expect-error react does not accept flattened DOM options
const _invalidFlattenedReact = react({ clipboardFormatKey: 'x-test' });
const DOMWithoutClipboard = dom({ clipboard: false });
const ReactWithoutClipboard = react({ dom: DOMWithoutClipboard });
const reactWithoutClipboardEditor = createEditor({
  extensions: [ReactWithoutClipboard],
  initialValue,
});
const HistoryExtension = history();
const _historyExtensionName: 'history' = HistoryExtension.name;
const DisabledHistoryExtension = history({ enabled: false });
const CustomApiExtension = defineExtension('custom-api', {
  api: () => ({
    ping: () => 'pong' as const,
  }),
});
const SpecialCommandExtension = defineExtension('special-command', {
  read: () => ({ value: () => 1 }),
});
const ExtraCommandExtension = defineExtension('extra-command', {
  read: () => ({ value: () => 2 }),
});
type SpecialCommandEditor = ReactEditor<
  CustomValue,
  readonly [typeof SpecialCommandExtension]
>;
const specialCommand = defineCommand<{ amount: number }, SpecialCommandEditor>(
  'react.special',
  {
    build: ({ input, state }) => {
      state['special-command'].value();

      return input.amount > 0 ? state.transaction(() => {}) : false;
    },
  }
);
type SpecialCompatibleCommand = CompatibleEditorCommand<
  SpecialCommandEditor,
  typeof specialCommand
>;
type SpecialCommandPayload = EditorCommandInput<typeof specialCommand>;
const compatibleSpecialCommand: SpecialCompatibleCommand = specialCommand;
const specialCommandPayload: SpecialCommandPayload = { amount: 1 };
const commandDescriptor: EditorCommandDescriptor = specialCommand;
const baseEditor = createEditor({ initialValue });
const historyOnlyEditor = createEditor({
  extensions: [HistoryExtension],
  initialValue,
});
const manualReactHistoryEditor = createEditor({
  extensions: [ReactExtension, HistoryExtension],
  initialValue,
});
const reactEditor = createEditor({
  extensions: [ReactExtension],
  initialValue,
});
const historyReactEditor = createReactEditor({
  extensions: [HistoryExtension],
  initialValue,
});
const defaultReactEditor = createReactEditor({ initialValue });
const noHistoryReactEditor = createReactEditor({
  extensions: [DisabledHistoryExtension],
  initialValue,
});
const customApiReactEditor = createReactEditor({
  extensions: [CustomApiExtension],
  initialValue,
});
const InferredSchema = defineEditorSchema('schema:derived', {
  elements: {
    paragraph: {
      content: schema.content.text(),
      properties: { align: property.string() },
    },
  },
  root: schema.content.type('paragraph'),
  unknown: 'reject',
});
type InferredSchemaValue = EditorValueFromExtensions<
  readonly [typeof InferredSchema]
>;
const inferredSchemaReactEditor = createReactEditor({
  extensions: [InferredSchema],
  initialValue: [
    {
      align: 'center',
      children: [{ text: 'schema inferred' }],
      type: 'paragraph',
    },
  ],
});
const typedInferredSchemaReactEditor: ReactEditor<
  InferredSchemaValue,
  readonly [typeof InferredSchema]
> = inferredSchemaReactEditor;
const inferredSchemaValue: ReadonlyArray<InferredSchemaValue[number]> =
  inferredSchemaReactEditor.read((state) => state.children());
const invalidInferredSchemaValue: ValueOf<typeof inferredSchemaReactEditor> = [
  {
    children: [{ text: '' }],
    // @ts-expect-error installed complete schema rejects unknown element types
    type: 'heading',
  },
];

const baseValue: ValueOf<typeof baseEditor> = [
  { type: 'paragraph', children: [{ text: 'one', bold: true }] },
];

const reactValue: ValueOf<typeof reactEditor> = [
  { type: 'paragraph', children: [{ text: 'one', bold: true }] },
];

historyOnlyEditor.update({ history: 'skip' }, () => {});
historyOnlyEditor.read((state) => state.history.undos());
historyOnlyEditor.update((tx) => tx.history.undo());
manualReactHistoryEditor.update({ history: 'skip' }, () => {});
manualReactHistoryEditor.api.react.isComposing();
manualReactHistoryEditor.api.dom.focus();
manualReactHistoryEditor.read((state) => state.history.undos());
manualReactHistoryEditor.update((tx) => tx.history.undo());

reactEditor.api.dom.resolvePath(pliteNode);
reactEditor.api.dom.clipboard.insertData(dataTransfer);
reactEditor.api.react.isComposing();
reactEditor.extension(ReactExtension).api.isComposing();
reactWithoutClipboardEditor.api.dom.focus();
// @ts-expect-error react({ dom }) preserves the exact disabled clipboard owner
reactWithoutClipboardEditor.api.dom.clipboard.insertData(dataTransfer);
// @ts-expect-error createReactEditor owns its enabled DOM descriptor
createReactEditor({ dom: DOMWithoutClipboard, initialValue });

historyReactEditor.read((state) => {
  const undos = state.history.undos();

  void undos;
});

historyReactEditor.update((tx) => {
  tx.history.undo();
});

historyReactEditor.update({ history: 'skip' }, () => {});
historyReactEditor.api.dom.focus();
historyReactEditor.api.dom.clipboard.writeSelection(dataTransfer);
historyReactEditor.api.react.isFocused();

const typedDefaultReactEditor: ReactEditor<CustomValue> = defaultReactEditor;
const typedNamespaceReactEditor: PliteReact.ReactEditor<CustomValue> =
  defaultReactEditor;
const typedCustomApiReactEditor: ReactEditor<
  CustomValue,
  readonly [typeof CustomApiExtension]
> = customApiReactEditor;
const typedNoHistoryReactEditor: ReactEditor<
  CustomValue,
  readonly [typeof DisabledHistoryExtension]
> = noHistoryReactEditor;

const assertStateFieldSetterPolicies = (
  defaultSetter: StateFieldSetter<string>
) => {
  defaultSetter('title', {
    history: 'new-batch',
    tags: 'title-input',
  });
};

void assertStateFieldSetterPolicies;

typedDefaultReactEditor.api.dom.focus();
typedDefaultReactEditor.api.react.isComposing();
typedNamespaceReactEditor.api.react.isFocused();
const customApiResult: 'pong' =
  typedCustomApiReactEditor.api['custom-api'].ping();

// @ts-expect-error Plite React no longer exports extension-owned renderer maps
void PliteReact.editableRenderers;

// @ts-expect-error Plite React no longer exports extension-owned key commands
void PliteReact.editableKeyCommands;

// @ts-expect-error public Editable command types are not root exports
type _NoEditableCommandContext = PliteReact.EditableCommandContext;

// @ts-expect-error ReactEditor exposes DOM through api.dom, not root dom
void typedDefaultReactEditor.dom;

// @ts-expect-error disabled history does not accept history update policy
typedNoHistoryReactEditor.update({ history: 'skip' }, () => {});

// @ts-expect-error disabled default history removes state history
noHistoryReactEditor.read((state) => state.history.undos());

// @ts-expect-error disabled default history removes tx history
noHistoryReactEditor.update((tx) => tx.history.undo());

// @ts-expect-error disabled default history rejects history update policy
noHistoryReactEditor.update({ history: 'skip' }, () => {});

const selectorOptions: EditorSelectorOptions<number> = {
  shouldUpdate: (change) => {
    const typedChange: EditorCommit | undefined = change;

    void typedChange;

    return true;
  },
};

const SelectorProbe = () => {
  const selected = useEditorSelector((selectedEditor) => {
    const valueFromSelector = selectedEditor.read((state) => state.children());

    void valueFromSelector;

    return valueFromSelector.length;
  }, selectorOptions);
  const inferredSelected: number = selected;

  void inferredSelected;
  void selected;

  return null;
};

const ContextCapabilityProbe = () => {
  const editor = PliteReact.useEditor();
  const result: 'pong' = editor.extension(CustomApiExtension).api.ping();

  void result;

  return null;
};

const HookProbe = () => {
  const hookEditor = usePliteEditor({
    extensions: [HistoryExtension],
    initialValue,
  });
  const valueFromHook: Readonly<CustomValue> = hookEditor.read((state) =>
    state.children()
  );

  hookEditor.read((state) => {
    const undos = state.history.undos();

    void undos;
  });

  hookEditor.update((tx) => {
    tx.history.undo();
  });

  hookEditor.update({ history: 'skip' }, () => {});
  hookEditor.api.dom.focus();
  hookEditor.api.react.isComposing();

  void valueFromHook;

  return null;
};

const SchemaHookProbe = () => {
  const editor = usePliteEditor({
    extensions: [InferredSchema],
    initialValue: [
      { children: [{ text: 'hook inferred' }], type: 'paragraph' },
    ],
  });
  const typedEditor: ReactEditor<
    InferredSchemaValue,
    readonly [typeof InferredSchema]
  > = editor;
  const value: ReadonlyArray<InferredSchemaValue[number]> = editor.read(
    (state) => state.children()
  );

  void typedEditor;
  void value;

  return null;
};

const CommandHookProbe = () => {
  const insertText = usePliteCommand(editorCommands.insertText);
  const insertBreak = usePliteCommand(editorCommands.insertBreak);
  const runSpecial = usePliteCommand<
    typeof specialCommand,
    CustomValue,
    readonly [typeof SpecialCommandExtension]
  >(specialCommand);
  const runSpecialWithExtra = usePliteCommand<
    typeof specialCommand,
    CustomValue,
    readonly [typeof SpecialCommandExtension, typeof ExtraCommandExtension]
  >(specialCommand);
  const typedSpecialDispatcher: (input: { amount: number }) => boolean =
    runSpecial;

  insertText({ text: 'typed' });
  insertBreak();
  runSpecial({ amount: 1 });
  runSpecialWithExtra({ amount: 1 });
  typedSpecialDispatcher({ amount: 1 });

  // @ts-expect-error insertText requires command input
  insertText();
  // @ts-expect-error insertText text must be a string
  insertText({ text: 1 });
  // @ts-expect-error extension-owned command requires SpecialCommandExtension
  usePliteCommand<typeof specialCommand, CustomValue>(specialCommand);
  // @ts-expect-error default runtime lacks SpecialCommandExtension
  usePliteCommand(specialCommand);
  // @ts-expect-error extension-owned command requires its payload
  runSpecial();
  // @ts-expect-error extension-owned command payload is typed
  runSpecial({ amount: '1' });

  return null;
};

const NoHistoryHookProbe = () => {
  const hookEditor = usePliteEditor({
    extensions: [history({ enabled: false })],
    initialValue,
  });

  // @ts-expect-error disabled default history removes hook state history
  hookEditor.read((state) => state.history.undos());

  return null;
};

const NamedRootRejectionProbe = () => {
  // @ts-expect-error omit root to address the primary editor
  usePliteRootEditor('main');
  // @ts-expect-error omit root to address primary root state
  usePliteRootState('main', (state) => state.children());
  // @ts-expect-error omit root to create primary root chrome
  usePliteRootChrome('main');
  // @ts-expect-error omit root to bind history to the primary document
  usePliteHistory({ root: 'main' });

  return (
    // @ts-expect-error omit root to render the primary document
    <Plite root="main">
      {/* @ts-expect-error omit root to render the primary editable */}
      <Editable root="main" />
    </Plite>
  );
};

// @ts-expect-error React is not installed on a plain editor
baseEditor.api.react.isComposing();

// @ts-expect-error DOM is not installed on a plain editor
baseEditor.api.dom.focus();

// @ts-expect-error public withReact wrapper is cut
void PliteReact.withReact;

const _placeholderAsSpan = (
  <PliteReact.PlitePlaceholder as="span">
    placeholder
  </PliteReact.PlitePlaceholder>
);

const _placeholderAsInput = (
  <PliteReact.PlitePlaceholder
    // @ts-expect-error PlitePlaceholder cannot render children inside void elements
    as="input"
  >
    placeholder
  </PliteReact.PlitePlaceholder>
);

const useInvalidWithEditorContract = () => {
  usePliteEditor({
    initialValue,
    // @ts-expect-error withEditor wrapper composition is cut
    withEditor: (editor) => editor,
  });
};

void baseValue;
void commandDescriptor;
void compatibleSpecialCommand;
void reactValue;
void specialCommandPayload;
void customApiResult;
void inferredSchemaValue;
void invalidInferredSchemaValue;
void useInvalidWithEditorContract;
void typedInferredSchemaReactEditor;
void _placeholderAsSpan;
void _placeholderAsInput;
void (null as unknown as EditableHidesDOMStrategyLayout);
void SelectorProbe;
void ContextCapabilityProbe;
void HookProbe;
void SchemaHookProbe;
void CommandHookProbe;
void NoHistoryHookProbe;
void NamedRootRejectionProbe;
