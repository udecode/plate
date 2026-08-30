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
