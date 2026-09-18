import {
  type CompatibleEditorCommand,
  createEditor as createHeadlessEditor,
  createEditorView,
  defineCommand,
  defineEditorSchema,
  definePlugin,
  type EditorCommandDescriptor,
  type EditorCommandInput,
  editorCommands,
  type EditorCommit,
  type EditorValueFromPlugins,
  type Node as PliteNode,
  property,
  schema,
  type ValueOf,
} from 'plitejs';
import { authored } from 'plitejs/authored';
import { dom } from 'plitejs/dom';
import { history } from 'plitejs/history';
import * as PliteReact from 'plitejs/react';
import {
  createEditor,
  Editable,
  type EditableProps,
  type Editor,
  type EditorSelectorOptions,
  EditorRoot,
  react,
  type StateFieldSetter,
  type Value,
  useEditor,
  useEditorSelector,
  useCommand,
  useEditorHistory,
  useRootChrome,
  useRootEditor,
  useRootState,
} from 'plitejs/react';

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
type EditableHasViewportPlan = 'viewportPlan' extends keyof EditableProps
  ? true
  : false;
type EditableHidesViewportPlan = ExpectFalse<EditableHasViewportPlan>;

const initialValue: CustomValue = [
  { type: 'paragraph', children: [{ text: 'initial', bold: true }] },
];

declare const dataTransfer: DataTransfer;
declare const pliteNode: PliteNode;

const ReactPlugin = react({ dom: dom() });
const _reactPluginName: 'react' = ReactPlugin.name;
// @ts-expect-error react requires an exact DOM descriptor
const _invalidZeroArgumentReact = react();
// @ts-expect-error react does not accept flattened DOM options
const _invalidFlattenedReact = react({ clipboardFormatKey: 'x-test' });
const DOMWithoutClipboard = dom({ clipboard: false });
const ReactWithoutClipboard = react({ dom: DOMWithoutClipboard });
const reactWithoutClipboardEditor = createHeadlessEditor({
  plugins: [ReactWithoutClipboard],
  initialValue,
});
const HistoryPlugin = history();
const _historyPluginName: 'history' = HistoryPlugin.name;
const DisabledHistoryPlugin = history({ enabled: false });
const CustomApiPlugin = definePlugin('custom-api', {
  api: () => ({
    ping: () => 'pong' as const,
  }),
});
const SpecialCommandPlugin = definePlugin('special-command', {
  read: () => ({ value: () => 1 }),
});
const ExtraCommandPlugin = definePlugin('extra-command', {
  read: () => ({ value: () => 2 }),
});
type SpecialCommandEditor = Editor<
  Value,
  readonly [typeof SpecialCommandPlugin]
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
const baseEditor = createHeadlessEditor({ initialValue });
const historyOnlyEditor = createHeadlessEditor({
  plugins: [HistoryPlugin],
  initialValue,
});
const manualReactHistoryEditor = createHeadlessEditor({
  plugins: [ReactPlugin, HistoryPlugin],
  initialValue,
});
const reactEditor = createHeadlessEditor({
  plugins: [ReactPlugin],
  initialValue,
});
const historyReactEditor = createEditor({
  plugins: [HistoryPlugin],
  initialValue,
});
const defaultReactEditor = createEditor({ initialValue });
const noHistoryReactEditor = createEditor({
  plugins: [DisabledHistoryPlugin],
  initialValue,
});
const customApiReactEditor = createEditor({
  plugins: [CustomApiPlugin],
  initialValue,
});
const AuthoredPlugin = authored({ authorId: 'type-contract' });
const authoredReactEditor = createEditor({
  plugins: [CustomApiPlugin, AuthoredPlugin],
  initialValue,
});
const configuredAuthoredView = createEditorView(authoredReactEditor, {
  authored: { intent: 'propose', projection: 'proposed' },
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
type InferredSchemaValue = EditorValueFromPlugins<
  readonly [typeof InferredSchema]
>;
const inferredSchemaReactEditor = createEditor({
  plugins: [InferredSchema],
  initialValue: [
    {
      align: 'center',
      children: [{ text: 'schema inferred' }],
      type: 'paragraph',
    },
  ],
});
const typedInferredSchemaReactEditor: Editor<
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
historyOnlyEditor.read((state) => state.history());
historyOnlyEditor.api.history.undo();
manualReactHistoryEditor.update({ history: 'skip' }, () => {});
manualReactHistoryEditor.api.react.isComposing();
manualReactHistoryEditor.api.dom.focus();
manualReactHistoryEditor.read((state) => state.history());
manualReactHistoryEditor.api.history.undo();

reactEditor.api.dom.resolvePath(pliteNode);
reactEditor.api.dom.clipboard.insertData(dataTransfer);
reactEditor.api.react.isComposing();
reactEditor.plugin(ReactPlugin).api.isComposing();
reactWithoutClipboardEditor.api.dom.focus();
// @ts-expect-error react({ dom }) preserves the exact disabled clipboard owner
reactWithoutClipboardEditor.api.dom.clipboard.insertData(dataTransfer);
// @ts-expect-error createEditor owns its enabled DOM descriptor
createEditor({ dom: DOMWithoutClipboard, initialValue });

historyReactEditor.read((state) => {
  const { undos } = state.history();

  void undos;
});

historyReactEditor.api.history.undo();

historyReactEditor.update({ history: 'skip' }, () => {});
historyReactEditor.api.dom.focus();
historyReactEditor.api.dom.clipboard.writeSelection(dataTransfer);
historyReactEditor.api.react.isFocused();

const typedDefaultReactEditor: Editor<CustomValue> = defaultReactEditor;
const typedNamespaceReactEditor: PliteReact.Editor<CustomValue> =
  defaultReactEditor;
const typedCustomApiReactEditor: Editor<
  CustomValue,
  readonly [typeof CustomApiPlugin]
> = customApiReactEditor;
const typedNoHistoryReactEditor: Editor<
  CustomValue,
  readonly [typeof DisabledHistoryPlugin]
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

// @ts-expect-error Plite React no longer exports plugin-owned renderer maps
void PliteReact.editableRenderers;
// @ts-expect-error public Runtime was removed; EditorRoot owns the mount
void PliteReact.Runtime;
// @ts-expect-error public useRuntime was removed; useEditor constructs editors
void PliteReact.useRuntime;
// @ts-expect-error public RuntimeValue was removed with Runtime
type _NoRuntimeValue = PliteReact.RuntimeValue;

// @ts-expect-error Plite React no longer exports plugin-owned key commands
void PliteReact.editableKeyCommands;

// @ts-expect-error public Editable command types are not root exports
type _NoEditableCommandContext = PliteReact.EditableCommandContext;

// @ts-expect-error Editor exposes DOM through api.dom, not root dom
void typedDefaultReactEditor.dom;

// @ts-expect-error disabled history does not expose the history service
typedNoHistoryReactEditor.api.history.undo();

// @ts-expect-error disabled default history removes state history
noHistoryReactEditor.read((state) => state.history());

// @ts-expect-error disabled default history removes the history service
noHistoryReactEditor.api.history.undo();

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
  const editor = PliteReact.useEditorContext();
  const result: 'pong' = editor.plugin(CustomApiPlugin).api.ping();

  void result;

  return null;
};

const HookProbe = () => {
  const hookEditor = useEditor({
    plugins: [HistoryPlugin],
    initialValue,
  });
  const valueFromHook: Readonly<CustomValue> = hookEditor.read((state) =>
    state.children()
  );

  hookEditor.read((state) => {
    const { undos } = state.history();

    void undos;
  });

  hookEditor.api.history.undo();

  hookEditor.update({ history: 'skip' }, () => {});
  hookEditor.api.dom.focus();
  hookEditor.api.react.isComposing();

  void valueFromHook;

  return null;
};

const SchemaHookProbe = () => {
  const editor = useEditor({
    plugins: [InferredSchema],
    initialValue: [
      { children: [{ text: 'hook inferred' }], type: 'paragraph' },
    ],
  });
  const typedEditor: Editor<
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
  const insertText = useCommand(editorCommands.insertText);
  const insertBreak = useCommand(editorCommands.insertBreak);
  const runSpecial = useCommand<
    typeof specialCommand,
    CustomValue,
    readonly [typeof SpecialCommandPlugin]
  >(specialCommand);
  const runSpecialWithExtra = useCommand<
    typeof specialCommand,
    CustomValue,
    readonly [typeof SpecialCommandPlugin, typeof ExtraCommandPlugin]
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
  // @ts-expect-error plugin-owned command requires SpecialCommandPlugin
  useCommand<typeof specialCommand, CustomValue>(specialCommand);
  // @ts-expect-error default runtime lacks SpecialCommandPlugin
  useCommand(specialCommand);
  // @ts-expect-error plugin-owned command requires its payload
  runSpecial();
  // @ts-expect-error plugin-owned command payload is typed
  runSpecial({ amount: '1' });

  return null;
};

const NoHistoryHookProbe = () => {
  const hookEditor = useEditor({
    plugins: [history({ enabled: false })],
    initialValue,
  });

  // @ts-expect-error disabled default history removes hook state history
  hookEditor.read((state) => state.history().undos);

  return null;
};

const NamedRootRejectionProbe = () => {
  // @ts-expect-error omit root to address the primary editor
  useRootEditor('main');
  // @ts-expect-error omit root to address primary root state
  useRootState('main', (state) => state.children());
  // @ts-expect-error omit root to create primary root chrome
  useRootChrome('main');
  // @ts-expect-error omit root to bind history to the primary document
  useEditorHistory({ root: 'main' });

  return (
    // @ts-expect-error omit root to render the primary document
    <EditorRoot editor={defaultReactEditor} root="main">
      {/* @ts-expect-error omit root to render the primary editable */}
      <Editable root="main" />
    </EditorRoot>
  );
};

const EditorRootInferenceProbe = () => (
  <>
    <EditorRoot
      decorations={[
        {
          id: 'typed-root-decoration',
          read: ({ editor }) => {
            const result: 'pong' = editor.api['custom-api'].ping();

            // @ts-expect-error decoration callbacks retain exact capabilities
            editor.api.missing.run();
            void result;

            return [];
          },
        },
      ]}
      editor={authoredReactEditor}
      onCommit={({ editor }) => {
        const result: 'pong' = editor.api['custom-api'].ping();

        // @ts-expect-error commit callbacks retain exact capabilities
        editor.api.missing.run();
        void result;
      }}
      root="notes"
    >
      {null}
    </EditorRoot>
    <EditorRoot
      authored={{ intent: 'edit', projection: 'accepted' }}
      editor={configuredAuthoredView}
      onValueChange={({ editor, value }) => {
        const result: 'pong' = editor.api['custom-api'].ping();

        value.forEach((node) => node.children);
        void result;
      }}
    >
      {null}
    </EditorRoot>
    {/* @ts-expect-error every public root requires an editor */}
    <EditorRoot>{null}</EditorRoot>
    <EditorRoot
      // @ts-expect-error authored policy requires the installed capability
      authored={{ intent: 'propose', projection: 'markup' }}
      editor={defaultReactEditor}
    >
      {null}
    </EditorRoot>
  </>
);

// @ts-expect-error React is not installed on a plain editor
baseEditor.api.react.isComposing();

// @ts-expect-error DOM is not installed on a plain editor
baseEditor.api.dom.focus();

// @ts-expect-error public withReact wrapper is cut
void PliteReact.withReact;

const _placeholderAsSpan = (
  <PliteReact.EditorPlaceholder as="span">
    placeholder
  </PliteReact.EditorPlaceholder>
);

const _placeholderAsInput = (
  <PliteReact.EditorPlaceholder
    // @ts-expect-error PlitePlaceholder cannot render children inside void elements
    as="input"
  >
    placeholder
  </PliteReact.EditorPlaceholder>
);

const useInvalidWithEditorContract = () => {
  useEditor({
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
void (null as unknown as EditableHidesViewportPlan);
void SelectorProbe;
void ContextCapabilityProbe;
void HookProbe;
void SchemaHookProbe;
void CommandHookProbe;
void NoHistoryHookProbe;
void NamedRootRejectionProbe;
void EditorRootInferenceProbe;
