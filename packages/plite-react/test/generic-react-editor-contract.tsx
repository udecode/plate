import {
  createEditor,
  type CompatibleEditorCommand,
  defineCommand,
  defineEditorExtension,
  editorCommands,
  type EditorCommit,
  type EditorCommandDescriptor,
  type EditorCommandInput,
  type Node as PliteNode,
  type ValueOf,
} from '@platejs/plite';
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

const ReactExtension = react();
const _reactExtensionName: 'react' = ReactExtension.name;
const HistoryExtension = history();
const _historyExtensionName: 'history' = HistoryExtension.name;
const DisabledHistoryExtension = history({ enabled: false });
const CustomApiExtension = defineEditorExtension({
  name: 'custom-api',
  api: {
    customApi: {
      ping: () => 'pong' as const,
    },
  },
});
const SpecialCommandExtension = defineEditorExtension({
  name: 'special-command',
  state: { special: () => ({ value: () => 1 }) },
});
const ExtraCommandExtension = defineEditorExtension({
  name: 'extra-command',
  state: { extra: () => ({ value: () => 2 }) },
});
type SpecialCommandEditor = ReactEditor<
  CustomValue,
  readonly [typeof SpecialCommandExtension]
>;
const specialCommand = defineCommand<{ amount: number }, SpecialCommandEditor>(
  'react.special',
  {
    build: ({ input, state }) => {
      state.special.value();

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
const defaultHistoryReactEditor = createReactEditor({ initialValue });
const noHistoryReactEditor = createReactEditor({
  extensions: [DisabledHistoryExtension],
  initialValue,
});
const customApiReactEditor = createReactEditor({
  extensions: [CustomApiExtension],
  initialValue,
});

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
reactEditor.api.clipboard.insertData(dataTransfer);
reactEditor.api.react.isComposing();
reactEditor.getApi(ReactExtension).isComposing();

historyReactEditor.read((state) => {
  const undos = state.history.undos();

  void undos;
});

historyReactEditor.update((tx) => {
  tx.history.undo();
});

historyReactEditor.update({ history: 'skip' }, () => {});
historyReactEditor.api.dom.focus();
historyReactEditor.api.clipboard.writeSelection(dataTransfer);
historyReactEditor.api.react.isFocused();

defaultHistoryReactEditor.read((state) => {
  const undos = state.history.undos();

  void undos;
});

defaultHistoryReactEditor.update((tx) => {
  tx.history.undo();
});

defaultHistoryReactEditor.update({ history: 'skip' }, () => {});
const typedDefaultReactEditor: ReactEditor<CustomValue> =
  defaultHistoryReactEditor;
const typedNamespaceReactEditor: PliteReact.ReactEditor<CustomValue> =
  defaultHistoryReactEditor;
const typedCustomApiReactEditor: ReactEditor<
  CustomValue,
  readonly [typeof CustomApiExtension]
> = customApiReactEditor;
const typedNoHistoryReactEditor: ReactEditor<
  CustomValue,
  readonly [typeof DisabledHistoryExtension]
> = noHistoryReactEditor;

const assertStateFieldSetterPolicies = (
  defaultSetter: StateFieldSetter<string>,
  noHistorySetter: StateFieldSetter<string, typeof typedNoHistoryReactEditor>
) => {
  defaultSetter('title', {
    history: 'new-batch',
    tags: 'title-input',
  });

  // @ts-expect-error disabled History rejects state-field history policy
  noHistorySetter('title', { history: 'skip' });
};

void assertStateFieldSetterPolicies;

typedDefaultReactEditor.update({ history: 'skip' }, () => {});
typedDefaultReactEditor.api.dom.focus();
typedDefaultReactEditor.api.react.isComposing();
typedNamespaceReactEditor.update({ history: 'skip' }, () => {});
const customApiResult: 'pong' = typedCustomApiReactEditor.api.customApi.ping();

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

const selectorOptions: EditorSelectorOptions<
  number,
  typeof historyReactEditor
> = {
  shouldUpdate: (change) => {
    const typedChange: EditorCommit<CustomValue> | undefined = change;

    void typedChange;

    return true;
  },
};

const SelectorProbe = () => {
  const selected = useEditorSelector(
    (selectedEditor: typeof historyReactEditor) => {
      const valueFromSelector: Readonly<CustomValue> = selectedEditor.read(
        (state) => state.children()
      );

      void valueFromSelector;

      return valueFromSelector.length;
    },
    selectorOptions
  );
  const inferredSelected: number = selected;

  void inferredSelected;
  void selected;

  return null;
};

const HookProbe = () => {
  const hookEditor = usePliteEditor({
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

usePliteEditor({
  initialValue,
  // @ts-expect-error withEditor wrapper composition is cut
  withEditor: (editor) => editor,
});

void baseValue;
void commandDescriptor;
void compatibleSpecialCommand;
void reactValue;
void specialCommandPayload;
void customApiResult;
void _placeholderAsSpan;
void _placeholderAsInput;
void (null as unknown as EditableHidesDOMStrategyLayout);
void SelectorProbe;
void HookProbe;
void CommandHookProbe;
void NoHistoryHookProbe;
void NamedRootRejectionProbe;
