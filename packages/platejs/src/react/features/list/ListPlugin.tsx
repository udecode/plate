import React from 'react';

import {
  type Editor,
  type EditorCommit,
  type NodeKey,
  PLUGINS,
  type RootKey,
} from '../../../core';
import { reportEditorLifecycleError } from '../../../facade';
import {
  BaseListPlugin,
  isOrderedList,
  ListType,
} from '../../../features/list/lib';
import {
  applyListCommit,
  readListOrdinalByKey,
  readListOrdinalChanges,
  readListRevisions,
} from '../../../features/list/lib/listIndex.internal';
import { toReactPlugin } from '../../core';
import { useEditorContext } from '../../internal/plite-components';
import { useEditorRuntimeState } from '../../plite-react';

const renumbers = (commit?: EditorCommit) =>
  !commit ||
  commit.changed.hasAny('structure') ||
  commit.changed.hasAny('properties') ||
  commit.changed.hasAny('replace');

// Resolving a key that is not mounted queries the DOM, so a large renumber,
// as in a virtualized view, walks the mounted lists instead.
const KEYED_WRITE_LIMIT = 1024;

const setStart = (
  list: HTMLOListElement | null | undefined,
  ordinal: number | undefined
) => {
  if (list && ordinal !== undefined && list.start !== ordinal) {
    list.start = ordinal;
  }
};

const writeHost = (editor: Editor, host: HTMLElement) =>
  setStart(
    host.querySelector('ol'),
    readListOrdinalByKey(
      editor,
      undefined,
      host.dataset.editorNodeKey as NodeKey
    )
  );

const rewriteMountedLists = (editor: Editor, content: HTMLElement) => {
  for (const list of content.querySelectorAll('ol')) {
    const host = list.closest<HTMLElement>('[data-editor-node-key]');

    if (host?.querySelector('ol') === list) writeHost(editor, host);
  }
};

// After each React commit that can move a number, set the changed numbers on
// the lists mounted in this view, content roots it renders included. Wrappers
// render their first number with `read.ordinal`; a renumber then writes
// `start` instead of rendering items.
function ListNumberWriter({ editor }: { editor: Editor }) {
  const view = useEditorContext();
  const root = view.read.view.root() ?? 'main';
  const lastCommit = useEditorRuntimeState(
    view,
    (state) => state.lastCommit(),
    { shouldUpdate: renumbers }
  );
  const written = React.useRef<Map<RootKey, number> | undefined>(undefined);

  React.useLayoutEffect(() => {
    // The view's commit can reach React before the plugin's commit handler.
    if (lastCommit) {
      try {
        applyListCommit(editor, lastCommit);
      } catch (error) {
        reportEditorLifecycleError(
          Object.freeze({
            cause: error,
            editor,
            phase: 'commit-listener',
            pluginName: PLUGINS.list,
          })
        );
      }
    }

    const { dom } = view.api;
    const content = dom.root();
    const previous = written.current;
    const revisions = readListRevisions(editor);

    if (!content) return;

    written.current = revisions;
    // The first render seeded every mounted number.
    if (!previous) return;

    const own: NodeKey[] = [];
    const other: NodeKey[] = [];

    for (const [indexRoot, revision] of revisions) {
      const from = previous.get(indexRoot);

      if (from === revision) continue;

      const keys =
        from === undefined
          ? undefined
          : readListOrdinalChanges(editor, indexRoot, from)?.keys;

      if (!keys) {
        rewriteMountedLists(editor, content);

        return;
      }
      (indexRoot === root ? own : other).push(...keys);
    }
    if (own.length + other.length > KEYED_WRITE_LIMIT) {
      rewriteMountedLists(editor, content);

      return;
    }
    for (const key of own) {
      setStart(
        dom.resolveDOMNode(key)?.querySelector('ol'),
        readListOrdinalByKey(editor, root, key)
      );
    }
    if (other.length === 0) return;
    for (const host of content.querySelectorAll<HTMLElement>(
      other
        .map((key) => `[data-editor-node-key="${CSS.escape(key)}"]`)
        .join(',')
    )) {
      writeHost(editor, host);
    }
  }, [editor, lastCommit, root, view]);

  return null;
}

/** Enables support for indented lists with React-specific features. */
export const ListPlugin = toReactPlugin(BaseListPlugin, {
  slots: {
    wrapNodeChildren: (props) => {
      const { listStyle, listType } = props.element;

      if (!listType) return undefined;

      return (innerProps) => {
        const List = isOrderedList(innerProps.element) ? 'ol' : 'ul';

        return (
          <List
            style={{
              listStyleType:
                listStyle ??
                (listType === ListType.Numbered ? 'decimal' : 'disc'),
            }}
            start={
              listType === ListType.Numbered
                ? innerProps.editor
                    .plugin(ListPlugin)
                    .read.ordinal(innerProps.element)
                : undefined
            }
          >
            <li>{innerProps.children}</li>
          </List>
        );
      };
    },
  },
}).extend(({ editor }) => ({
  slots: {
    afterEditable: () => <ListNumberWriter editor={editor} />,
  },
}));
