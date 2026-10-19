import type React from 'react';

import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import type {
  AnyBasePlugin,
  AnyBasePluginPortal,
  AnyPluginBase,
  BasePluginInput,
  Editor,
} from '../../lib';
import { withPlateFormatCompilation } from '../../lib/editor/withPlite';

export type StaticComponentOverrides = Readonly<
  Record<string, React.ComponentType<any> | undefined>
>;

type Peers = Readonly<Record<string, AnyBasePlugin>>;

type StaticPresentation = Readonly<{
  components?: StaticComponentOverrides;
  missing: Set<string>;
  peers?: Peers;
}>;

const PRESENTATIONS = new WeakMap<object, StaticPresentation>();
const COMPILED = new WeakMap<
  object,
  Readonly<{ peers: Peers; plugins: readonly BasePluginInput[] }>
>();

const compilePeers = (plugins: readonly BasePluginInput[]) => {
  const compiled = COMPILED.get(plugins);

  if (
    compiled?.plugins.length === plugins.length &&
    compiled.plugins.every((plugin, index) => plugin === plugins[index])
  ) {
    return compiled.peers;
  }

  const peers = withPlateFormatCompilation(
    { plugins },
    ({ editor }) => getPlateRuntime(editor).plugins
  );

  COMPILED.set(plugins, { peers, plugins: [...plugins] });

  return peers;
};

/**
 * Returns the set that rendering fills with the names of plugins whose drawing
 * the presentation lacked.
 */
export const bindStaticPresentation = (
  editor: Editor,
  {
    components,
    plugins,
  }: Readonly<{
    components?: StaticComponentOverrides;
    plugins?: readonly BasePluginInput[];
  }>
): ReadonlySet<string> => {
  const missing = new Set<string>();

  if (components || plugins) {
    PRESENTATIONS.set(editor, {
      components,
      missing,
      peers: plugins && compilePeers(plugins),
    });
  }

  return missing;
};

export const hasStaticPresentation = (editor: Editor) =>
  !!PRESENTATIONS.get(editor)?.peers;

export const inheritStaticPresentation = (base: Editor, view: Editor) => {
  const presentation = PRESENTATIONS.get(base);

  if (presentation) PRESENTATIONS.set(view, presentation);
};

type DrawnPlugin = AnyBasePluginPortal | AnyPluginBase;

const isComponent = (component: unknown) =>
  !!component && typeof component !== 'string';

const resolveDrawing = <T>(
  editor: Editor,
  plugin: DrawnPlugin,
  feature: 'render' | 'slots',
  read: (plugin: DrawnPlugin) => T | null | undefined,
  readInstalled: (plugin: DrawnPlugin) => unknown = read
) => {
  const own = read(plugin) ?? undefined;
  const presentation = PRESENTATIONS.get(editor);

  if (!presentation?.peers) return own;
  if (isEditOnly(true, plugin, feature)) return undefined;
  const peer = presentation.peers[plugin.name];
  const drawing = peer ? (read(peer) ?? undefined) : undefined;

  if (drawing !== undefined) return drawing;
  if (!isComponent(readInstalled(plugin))) return own;
  presentation.missing.add(plugin.name);

  return undefined;
};

export const getStaticElementComponent = (
  editor: Editor,
  plugin: DrawnPlugin
) =>
  PRESENTATIONS.get(editor)?.components?.[plugin.name] ??
  resolveDrawing(editor, plugin, 'render', ({ component }) => component);

export const getStaticMarkComponent = (
  editor: Editor,
  plugin: DrawnPlugin,
  placement: 'leaf' | 'text'
) =>
  resolveDrawing(editor, plugin, 'render', ({ component, render }) =>
    placement === 'text'
      ? component
      : (render.mark?.leafComponent ??
        (render.mark?.placement === 'text' ? undefined : component))
  );

/**
 * Static rendering calls the returned slot as a plain function, so a slot in
 * any other shape, such as a `wrapNode` wrapper descriptor
 * (`{ component, match }`) or a `React.memo` `afterNodeChildren`, is skipped.
 * With a presentation, an installed `afterNodeChildren` component, memo
 * included, is reported missing when the presentation has no function for it;
 * an installed wrapper in another shape is editing UI and is not reported.
 */
export const getStaticSlot = (
  editor: Editor,
  plugin: DrawnPlugin,
  slot: 'afterNodeChildren' | 'wrapNode' | 'wrapNodeChildren'
) => {
  const readFunction = ({ slots }: DrawnPlugin) => {
    const drawing = slots[slot];

    return typeof drawing === 'function' ? drawing : undefined;
  };

  return resolveDrawing(
    editor,
    plugin,
    'slots',
    readFunction,
    slot === 'afterNodeChildren'
      ? ({ slots }) => slots.afterNodeChildren
      : readFunction
  );
};
