import React from 'react';

import type { Descendant, Element, Point } from '../../facade';
import { NodeApi } from '../../facade';
import { failInvariant } from '../../internal/failInvariant';
import { getCompiledPlatePlugin } from '../../internal/plugin/compilePlateModel';
import { getPluginStore } from '../../internal/plugin/pluginStore';
import { createPluginContext } from '../../lib/plugin/createPluginContext.internal';
import type { Editor } from '../editor/Editor';
import type {
  PliteDecorationSource,
  PliteRangeDecoration,
} from '../plite-react';
import { usePliteRangeDecorationSource } from '../plite-react';
import { useIsomorphicLayoutEffect } from './react-helpers';

export const PLATE_PLUGIN_DECORATION_SOURCE = '__platePluginDecorationSource';

const EMPTY_SOURCES = Object.freeze([]) as readonly PliteDecorationSource[];
const EDITOR_TO_PLUGIN_SOURCES = new WeakMap<
  Editor,
  Map<string, Set<PliteDecorationSource>>
>();

export const refreshPlatePluginDecorations = (editor: Editor, name: string) => {
  for (const source of EDITOR_TO_PLUGIN_SOURCES.get(editor)?.get(name) ?? []) {
    source.refresh({
      reason: 'external',
      requiresDOMSelectionExport: editor.api.react.isFocused(),
    });
  }
};

const registerPlatePluginDecorationSource = (
  editor: Editor,
  name: string,
  source: PliteDecorationSource
) => {
  const byName = EDITOR_TO_PLUGIN_SOURCES.get(editor) ?? new Map();
  const sources = byName.get(name) ?? new Set();

  sources.add(source);
  byName.set(name, sources);
  EDITOR_TO_PLUGIN_SOURCES.set(editor, byName);

  return () => {
    sources.delete(source);
    if (sources.size === 0) byName.delete(name);
    if (byName.size === 0) EDITOR_TO_PLUGIN_SOURCES.delete(editor);
  };
};

type RenderSources = (
  sources: ReadonlyArray<PliteDecorationSource<any>>
) => React.ReactNode;

type PlatePluginDecorationSourceComponent = React.ComponentType<{
  children: (source: PliteDecorationSource<any>) => React.ReactNode;
  editor: Editor;
  name: string;
  revision: unknown;
}>;

const PLATE_PLUGIN_DECORATION_SOURCE_COMPONENT = Symbol.for(
  'platejs/react/plugin-decoration-source-component/v1'
);

/** Attach a package-owned source without adding another public plugin field. */
export const setPlatePluginDecorationSourceComponent = <
  TDecorate extends (...args: any[]) => unknown,
>(
  decorate: TDecorate,
  component: PlatePluginDecorationSourceComponent
): TDecorate => {
  Object.defineProperty(decorate, PLATE_PLUGIN_DECORATION_SOURCE_COMPONENT, {
    configurable: false,
    enumerable: false,
    value: component,
    writable: false,
  });

  return decorate;
};

const getPlatePluginDecorationSourceComponent = (decorate: unknown) =>
  typeof decorate === 'function'
    ? (Reflect.get(decorate, PLATE_PLUGIN_DECORATION_SOURCE_COMPONENT) as
        | PlatePluginDecorationSourceComponent
        | undefined)
    : undefined;

const PlateDefaultPluginDecorationSource = ({
  children,
  editor,
  name,
  revision,
}: {
  children: (source: PliteDecorationSource<any>) => React.ReactNode;
  editor: Editor;
  name: string;
  revision: unknown;
}) => {
  const plugin =
    getCompiledPlatePlugin(editor, name) ??
    failInvariant('Expected value to be defined');
  const decorate =
    plugin.decorate ?? failInvariant('Expected value to be defined');
  const context = React.useMemo(
    () => createPluginContext(editor, plugin),
    [editor, plugin]
  );
  const sourceId = `plate-plugin-decorate:${name}`;
  const source = usePliteRangeDecorationSource(editor, {
    id: sourceId,
    read: ({ snapshot }) => {
      const root = { children: snapshot.children } as unknown as Element;
      const decorations: Array<PliteRangeDecoration<Record<string, unknown>>> =
        [];

      for (const [node, path] of NodeApi.nodes(root)) {
        if (path.length === 0) continue;

        const ranges: unknown = Reflect.apply(decorate, undefined, [
          Object.assign(Object.create(context), {
            entry: [node as Descendant, path],
          }),
        ]);

        if (!Array.isArray(ranges)) continue;

        ranges.forEach((decoratedRange, index) => {
          const { anchor, focus, ...data } = decoratedRange as Record<
            string,
            unknown
          > & {
            anchor: Point;
            focus: Point;
          };

          decorations.push({
            data: {
              ...data,
              [PLATE_PLUGIN_DECORATION_SOURCE]: name,
            },
            key: `${sourceId}:${path.join('.')}:${index}`,
            range: { anchor, focus },
          });
        });
      }

      return decorations;
    },
    revision,
  });

  useIsomorphicLayoutEffect(() => {
    const store = getPluginStore(editor, name);

    return store?.public.subscribe(() => {
      source.refresh({
        reason: 'external',
        requiresDOMSelectionExport: editor.api.react.isFocused(),
      });
    });
  }, [editor, name, source]);
  return children(source);
};

const PlateRegisteredPluginDecorationSource = ({
  children,
  editor,
  name,
  source,
}: {
  children: (source: PliteDecorationSource<any>) => React.ReactNode;
  editor: Editor;
  name: string;
  source: PliteDecorationSource<any>;
}) => {
  useIsomorphicLayoutEffect(
    () => registerPlatePluginDecorationSource(editor, name, source),
    [editor, name, source]
  );

  return children(source);
};

const PlatePluginDecorationSource = (props: {
  children: (source: PliteDecorationSource<any>) => React.ReactNode;
  editor: Editor;
  name: string;
  revision: unknown;
}) => {
  const plugin =
    getCompiledPlatePlugin(props.editor, props.name) ??
    failInvariant('Expected value to be defined');
  const SourceComponent = getPlatePluginDecorationSourceComponent(
    plugin.decorate
  );
  const component = SourceComponent ?? PlateDefaultPluginDecorationSource;
  const componentProps: {
    children: (source: PliteDecorationSource<any>) => React.ReactNode;
    editor: Editor;
    name: string;
    revision: unknown;
  } = {
    ...props,
    children: (source) => (
      <PlateRegisteredPluginDecorationSource
        editor={props.editor}
        name={props.name}
        source={source}
      >
        {props.children}
      </PlateRegisteredPluginDecorationSource>
    ),
  };

  return React.createElement(component, componentProps);
};

const PlatePluginDecorationSourcesResult = ({
  children,
  pluginSources,
  sources,
}: {
  children: RenderSources;
  pluginSources: ReadonlyArray<PliteDecorationSource<any>>;
  sources?: ReadonlyArray<PliteDecorationSource<any>> | null;
}) => {
  const compiledSources = React.useMemo(
    () => [...pluginSources, ...(sources ?? [])],
    [pluginSources, sources]
  );

  return children(compiledSources);
};

export const PlatePluginDecorationSources = ({
  children,
  editor,
  names,
  revision,
  sources,
  index = 0,
  pluginSources = EMPTY_SOURCES,
}: {
  children: RenderSources;
  editor: Editor;
  names: readonly string[];
  revision: unknown;
  sources?: ReadonlyArray<PliteDecorationSource<any>> | null;
  index?: number;
  pluginSources?: ReadonlyArray<PliteDecorationSource<any>>;
}): React.ReactNode => {
  const name = names[index];

  if (!name) {
    return (
      <PlatePluginDecorationSourcesResult
        pluginSources={pluginSources}
        sources={sources}
      >
        {children}
      </PlatePluginDecorationSourcesResult>
    );
  }

  return (
    <PlatePluginDecorationSource
      key={name}
      editor={editor}
      name={name}
      revision={revision}
    >
      {(source) => (
        <PlatePluginDecorationSources
          editor={editor}
          index={index + 1}
          names={names}
          pluginSources={[...pluginSources, source]}
          revision={revision}
          sources={sources}
        >
          {children}
        </PlatePluginDecorationSources>
      )}
    </PlatePluginDecorationSource>
  );
};
