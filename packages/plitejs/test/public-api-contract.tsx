import {
  createEditor as createHeadlessEditor,
  createEditorView,
  type CreateEditorOptions as CreateHeadlessEditorOptions,
  definePlugin,
  type Editor as HeadlessEditor,
  type EditorDocumentRange,
  type Range,
} from 'plitejs';
import {
  authored,
  type AuthoredChange,
  type AuthoredChangeDetails,
  type AuthoredChangePart,
  type AuthoredResult,
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

const ping = definePlugin('ping', {
  api: () => ({ ping: () => 'pong' as const }),
});

const headlessBaseOptions: CreateHeadlessEditorOptions = {};
const headlessOptions = { plugins: [ping] } as const;
const headlessEditor = createHeadlessEditor(headlessOptions);
const headlessResult: 'pong' = headlessEditor.api.ping.ping();
const typedHeadlessEditor: HeadlessEditor = headlessEditor;

const reactBaseOptions: CreateReactEditorOptions = {};
const reactOptions = { plugins: [ping] } as const;
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
    plugins: [authored({ authorId: () => 'alice' })],
  });
  const view = createEditorView(editor, {
    authored: { intent: 'propose' },
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
  view.api.authored.setView({ preview: 'accepted' });
  view.api.authored.setView({ intent: 'edit' });
  view.api.authored.setView({ preview: 'proposed' });
  view.update((tx) => {
    const policy: AuthoredView = tx.authored.view();
    tx.authored.propose({ changeId: 'retained' });
    if ('intent' in policy) tx.text.insert(policy.intent);
  });
  createEditorView(createHeadlessEditor(), {
    // @ts-expect-error native proposal views require the authored capability
    authored: { intent: 'propose' },
  });
  if ('intent' in viewPolicy) {
    // @ts-expect-error native view policy is immutable
    viewPolicy.intent = 'edit';
  }
  void viewChildren;
  editor.update((tx) => {
    const identity: string = tx.authored.propose();
    tx.text.insert(identity);
    // @ts-expect-error authored intent uses a logical change identity
    tx.authored.propose({ changeId: 1 });
  });
  const changes: readonly AuthoredChange[] = editor.read.authored.changes({
    authorId: 'alice',
    limit: 20,
  }).items;
  const changesAt: readonly AuthoredChange[] = editor.read.authored.changes({
    at: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    },
  }).items;
  const details: AuthoredChangeDetails | null = editor.read.authored.details(
    changes[0]?.id ?? ''
  );
  const parts: readonly AuthoredChangePart[] = details?.parts ?? [];
  // @ts-expect-error a place is a location or a node key
  editor.read.authored.changes({ at: 1 });
  // @ts-expect-error details lookup requires a logical change identity
  editor.read.authored.details(1);
  const result: AuthoredResult | undefined = editor.update.authored.decide({
    action: 'accept',
    changes,
  });
  // @ts-expect-error a direct update answers undefined when it is refused
  const landed: AuthoredResult = editor.update.authored.decide({
    action: 'accept',
    changes,
  });
  void changesAt;
  void parts;
  void landed;
  if (result?.status === 'applied') {
    // @ts-expect-error decided identities are immutable
    result.ids.push('another');
  }
  editor.update((tx) =>
    tx.authored.decide({ action: 'reject', changes: changesAt })
  );
  // @ts-expect-error read changes are immutable snapshots
  changes.push(changes[0]);
  // @ts-expect-error authored reads require the installed capability
  createHeadlessEditor().read.authored.changes();
  return { changes, result };
};

void assertAuthoredInference;
