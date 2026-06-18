import {
  createEditor,
  defineEditorExtension,
  type EditorCommit,
  type Operation,
  type Node as SlateNode,
  type ValueOf,
} from '@platejs/slate';
import { history } from '@platejs/slate-history';
import * as SlateReact from '@platejs/slate-react';
import {
  createReactEditor,
  type EditorSelectorOptions,
  type ReactEditor,
  react,
  useEditorSelector,
  useSlateEditor,
} from '@platejs/slate-react';

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

const initialValue: CustomValue = [
  { type: 'paragraph', children: [{ text: 'initial', bold: true }] },
];

declare const dataTransfer: DataTransfer;
declare const slateNode: SlateNode;

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

historyOnlyEditor.api.history.withoutSaving(() => {});
historyOnlyEditor.read((state) => state.history.undos());
historyOnlyEditor.update((tx) => tx.history.undo());
manualReactHistoryEditor.api.history.withoutSaving(() => {});
manualReactHistoryEditor.api.react.isComposing();
manualReactHistoryEditor.api.dom.focus();
manualReactHistoryEditor.read((state) => state.history.undos());
manualReactHistoryEditor.update((tx) => tx.history.undo());

reactEditor.api.dom.resolvePath(slateNode);
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

historyReactEditor.api.history.withoutSaving(() => {});
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

defaultHistoryReactEditor.api.history.withoutSaving(() => {});
const typedDefaultReactEditor: ReactEditor<CustomValue> =
  defaultHistoryReactEditor;
const typedNamespaceReactEditor: SlateReact.ReactEditor<CustomValue> =
  defaultHistoryReactEditor;
const typedCustomApiReactEditor: ReactEditor<
  CustomValue,
  readonly [typeof CustomApiExtension]
> = customApiReactEditor;
const typedNoHistoryReactEditor: ReactEditor<
  CustomValue,
  readonly [typeof DisabledHistoryExtension]
> = noHistoryReactEditor;

typedDefaultReactEditor.api.history.withoutSaving(() => {});
typedDefaultReactEditor.api.dom.focus();
typedDefaultReactEditor.api.react.isComposing();
typedNamespaceReactEditor.api.history.withoutSaving(() => {});
const customApiResult: 'pong' = typedCustomApiReactEditor.api.customApi.ping();

// @ts-expect-error Slate React no longer exports extension-owned renderer maps
SlateReact.editableRenderers;

// @ts-expect-error Slate React no longer exports extension-owned key commands
SlateReact.editableKeyCommands;

// @ts-expect-error public Editable command types are not root exports
type _NoEditableCommandContext = SlateReact.EditableCommandContext;

// @ts-expect-error ReactEditor exposes DOM through api.dom, not root dom
typedDefaultReactEditor.dom;

// @ts-expect-error disabled history does not contribute public ReactEditor api
typedNoHistoryReactEditor.api.history.withoutSaving(() => {});

// @ts-expect-error disabled default history removes state history
noHistoryReactEditor.read((state) => state.history.undos());

// @ts-expect-error disabled default history removes tx history
noHistoryReactEditor.update((tx) => tx.history.undo());

// @ts-expect-error disabled default history removes history api
noHistoryReactEditor.api.history.withoutSaving(() => {});

const selectorOptions: EditorSelectorOptions<typeof historyReactEditor> = {
  shouldUpdate: (operations, change) => {
    const typedOperations: readonly Operation<CustomValue>[] | undefined =
      operations;
    const typedChange: EditorCommit<CustomValue> | undefined = change;

    void typedOperations;
    void typedChange;

    return true;
  },
};

const SelectorProbe = () => {
  const selected = useEditorSelector(
    (selectedEditor: typeof historyReactEditor, operations) => {
      const valueFromSelector: Readonly<CustomValue> = selectedEditor.read(
        (state) => state.value.root()
      );
      const typedOperations: readonly Operation<CustomValue>[] | undefined =
        operations;

      void valueFromSelector;
      void typedOperations;

      return valueFromSelector.length;
    },
    undefined,
    selectorOptions
  );
  const inferredSelected: number = selected;

  void inferredSelected;
  void selected;

  return null;
};

const HookProbe = () => {
  const hookEditor = useSlateEditor({
    initialValue,
  });
  const valueFromHook: Readonly<CustomValue> = hookEditor.read((state) =>
    state.value.root()
  );

  hookEditor.read((state) => {
    const undos = state.history.undos();

    void undos;
  });

  hookEditor.update((tx) => {
    tx.history.undo();
  });

  hookEditor.api.history.withoutSaving(() => {});
  hookEditor.api.dom.focus();
  hookEditor.api.react.isComposing();

  void valueFromHook;

  return null;
};

const NoHistoryHookProbe = () => {
  const hookEditor = useSlateEditor({
    extensions: [history({ enabled: false })],
    initialValue,
  });

  // @ts-expect-error disabled default history removes hook state history
  hookEditor.read((state) => state.history.undos());

  return null;
};

// @ts-expect-error React is not installed on a plain editor
baseEditor.api.react.isComposing();

// @ts-expect-error DOM is not installed on a plain editor
baseEditor.api.dom.focus();

// @ts-expect-error public withReact wrapper is cut
SlateReact.withReact;

const _placeholderAsSpan = (
  <SlateReact.SlatePlaceholder as="span">
    placeholder
  </SlateReact.SlatePlaceholder>
);

const _placeholderAsInput = (
  <SlateReact.SlatePlaceholder
    // @ts-expect-error SlatePlaceholder cannot render children inside void elements
    as="input"
  >
    placeholder
  </SlateReact.SlatePlaceholder>
);

useSlateEditor({
  initialValue,
  // @ts-expect-error withEditor wrapper composition is cut
  withEditor: (editor) => editor,
});

void baseValue;
void reactValue;
void customApiResult;
void _placeholderAsSpan;
void _placeholderAsInput;
void SelectorProbe;
void HookProbe;
void NoHistoryHookProbe;
