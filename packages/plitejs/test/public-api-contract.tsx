import {
  createEditor as createHeadlessEditor,
  type CreateEditorOptions as CreateHeadlessEditorOptions,
  defineExtension,
  type Editor as HeadlessEditor,
} from 'plitejs';
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
