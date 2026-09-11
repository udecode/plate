import {
  createEditor as createHeadlessEditor,
  createEditorView,
  type CreateEditorOptions as CreateHeadlessEditorOptions,
  defineExtension,
  type Editor as HeadlessEditor,
  type EditorDocumentRange,
  type Range,
} from 'plitejs';
import {
  authored,
  type AuthoredChange,
  type AuthoredResult,
  type AuthoredSelection,
  type AuthoredView,
} from 'plitejs/authored';
import {
  createEditor as createReactViewEditor,
  type CreateEditorOptions as CreateReactEditorOptions,
  type Editor as ReactEditor,
  type EditableProps,
  type ExternalTextAdapter,
  useEditor,
  useEditorContext,
  useOptionalEditorContext,
} from 'plitejs/react';

const ping = defineExtension('ping', {
  api: () => ({ ping: () => 'pong' as const }),
});

const headlessBaseOptions: CreateHeadlessEditorOptions = {};
const headlessOptions = { extensions: [ping] } as const;
const headlessEditor = createHeadlessEditor(headlessOptions);
const headlessResult: 'pong' = headlessEditor.api.ping.ping();
const typedHeadlessEditor: HeadlessEditor = headlessEditor;

const reactBaseOptions: CreateReactEditorOptions = {};
const reactOptions = { extensions: [ping] } as const;
const reactEditor = createReactViewEditor(reactOptions);
const reactResult: 'pong' = reactEditor.api.ping.ping();
const typedReactEditor: ReactEditor = reactEditor;

const HookContract = () => {
  const ownedEditor = useEditor(reactOptions, []);
  const mountedEditor = useEditorContext();
  const optionalEditor = useOptionalEditorContext();

  ownedEditor.api.ping.ping();
  mountedEditor.read((state) => state.children());
  optionalEditor?.read((state) => state.children());

  return null;
};

void HookContract;
void headlessBaseOptions;
void headlessResult;
void reactBaseOptions;
void reactResult;
void typedHeadlessEditor;
void typedReactEditor;

const externalAdapter: ExternalTextAdapter<{
  language: 'javascript' | 'text';
}> = {
  mount({ actions, host, state }) {
    const language: 'javascript' | 'text' = state.config.language;
    host.setAttribute('data-language', language);
    actions.select({
      baseVersion: state.version,
      selection: { anchor: 0, focus: 0 },
    });
    // @ts-expect-error adapters have no mutable editor escape hatch
    actions.editor.update.text.insert('bad');
    actions.dispatch({
      baseVersion: state.version,
      changes: [],
      // @ts-expect-error unsupported intents are not accepted
      intent: 'format',
      selection: { anchor: 0, focus: 0 },
    });
    return {
      destroy() {},
      focus() {},
      update({ changes, state: next }) {
        const nextLanguage: 'javascript' | 'text' = next.config.language;
        const inserted: string | undefined = changes?.[0]?.insert;
        void [nextLanguage, inserted];
      },
    };
  },
};
const externalRenderer: NonNullable<EditableProps['renderElement']> = ({
  attributes,
  slots,
}) => {
  void slots.externalText({
    adapter: externalAdapter,
    ariaLabel: 'Code',
    config: { language: 'javascript' },
  });
  // @ts-expect-error adapter configuration is required and inferred
  void slots.externalText({ adapter: externalAdapter, ariaLabel: 'Code' });
  void slots.externalText({
    adapter: externalAdapter,
    ariaLabel: 'Code',
    // @ts-expect-error configuration follows the adapter's literal domain
    config: { language: 'rust' },
  });
  return (
    <div {...attributes}>
      {slots.externalText({
        adapter: { mount: () => ({ destroy() {}, focus() {}, update() {} }) },
        ariaLabel: 'Plain text',
      })}
    </div>
  );
};
void externalRenderer;

const assertAuthoredInference = () => {
  const editor = createHeadlessEditor({
    extensions: [authored({ authorId: () => 'alice', retainHistory: true })],
  });
  const view = createEditorView(editor, {
    authored: { intent: 'propose', projection: 'markup' },
  });
  const viewPolicy: AuthoredView = view.read.authored.view();
  const anchor = view.anchor(
    { anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 1 } },
    { deletion: 'drop' }
  );
  const saved: EditorDocumentRange = view.anchor.save(anchor);
  const restored = view.anchor.restore(saved);
  const resolved: Range | null = restored.resolve();
  view.anchor.save(
    // @ts-expect-error saved document targets are ranges
    view.anchor({ path: [0, 0], offset: 0 }, { deletion: 'drop' })
  );
  anchor.release();
  restored.release();
  void resolved;
  const viewChildren: ReturnType<typeof editor.read.children> =
    view.read.children();
  view.api.authored.setView({ intent: 'edit', projection: 'accepted' });
  view.update((tx) => {
    const policy: AuthoredView = tx.authored.view();
    tx.authored.propose({ changeId: 'retained' });
    tx.text.insert(policy.intent);
  });
  createEditorView(createHeadlessEditor(), {
    // @ts-expect-error native proposal views require the authored capability
    authored: { intent: 'propose', projection: 'proposed' },
  });
  // @ts-expect-error proposal input cannot edit an accepted-only projection
  view.api.authored.setView({ intent: 'propose', projection: 'accepted' });
  // @ts-expect-error native view policy is immutable
  viewPolicy.intent = 'edit';
  void viewChildren;
  editor.update((tx) => {
    const identity: string = tx.authored.propose();
    tx.text.insert(identity);
    // @ts-expect-error authored intent uses a logical change identity
    tx.authored.propose({ changeId: 1 });
  });
  const selection: AuthoredSelection = editor.read.authored.select({
    authorId: 'alice',
    status: 'pending',
  });
  const changes: readonly AuthoredChange[] = editor.read.authored.changes({
    authorId: 'alice',
    limit: 20,
  }).items;
  const result: AuthoredResult = editor.update.authored.decide({
    action: 'accept',
    selection,
  });
  const reverted: AuthoredResult = editor.update.authored.revert({ selection });
  if (reverted.status === 'applied') {
    // @ts-expect-error compensation identities are immutable
    reverted.ids.push('another');
  }
  editor.update((tx) => {
    const transactionResult: AuthoredResult = tx.authored.decide({
      action: 'reject',
      selection,
    });
    const transactionRevert: AuthoredResult = tx.authored.revert({ selection });
    void transactionRevert;
    return transactionResult;
  });
  // @ts-expect-error propose is a transaction-only intent control
  editor.update.authored.propose();
  // @ts-expect-error public selections are immutable snapshots
  selection.changes.push({ id: 'new', heads: [], revision: 1 });
  // @ts-expect-error authored reads require the installed capability
  createHeadlessEditor().read.authored.changes();
  return { changes, result };
};

void assertAuthoredInference;
