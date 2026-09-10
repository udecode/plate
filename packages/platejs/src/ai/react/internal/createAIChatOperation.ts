import isEqual from 'lodash/isEqual.js';

import {
  type Anchor,
  type Editor,
  type Element,
  type NamedRootKey,
  type NodeKey,
  type Path,
  type Range,
  type Value,
  createEditorView,
  ElementApi,
  NodeApi,
  PathApi,
  SelectionApi,
  TextApi,
  PLUGINS,
} from '../../../core';
import { getCommentKey } from '../../../features/comment';
import { BaseSuggestionPlugin } from '../../../features/suggestion';
import { createPluginStateSnapshot } from '../../../internal/plugin/pluginStore';
import { MarkdownPlugin } from '../../../markdown';
import { createMarkdownStream } from '../../../markdown/lib/internal/createMarkdownStream';

export type AIChatComment = Readonly<{
  id: string;
  comment: string;
  content: string;
}>;
type Reference = { key: NodeKey; node: Element; root?: NamedRootKey };

/** One request's observable draft. Its nodes never belong to the live editor. */
export type AIChatOperation = Readonly<{
  id: number;
  status: 'streaming' | 'ready' | 'error';
  source: string;
  value: Value;
  preview: Value;
  targets: readonly NodeKey[];
  root?: NamedRootKey;
  error?: string;
  partial: boolean;
  comments: readonly AIChatComment[];
}>;

type Member = { key: NodeKey; node: Element; anchor: Anchor<Path> };

/** Owns request identity, detached parsing and the single formal commit. */
export const createAIChatOperation = (
  editor: Editor,
  publish: (operation: AIChatOperation | null) => void
) => {
  let snapshot = createPluginStateSnapshot();
  let serial = 0;
  let operation: AIChatOperation | null = null;
  let parser = createMarkdownStream(editor);
  let members: Member[] = [];
  let selection: Anchor<Range> | null = null;
  let view = editor;
  let nodeSelecting = false;
  let mode: 'chat' | 'insert' = 'insert';
  let edit = false;
  let original: Value = [];
  let suggestionIdentity: { id: string; createdAt: number } | undefined;
  let accepting = false;
  let references = new Map<NodeKey, Reference>();
  const cells = new Map<NodeKey, Value>();
  const comments = new Map<
    string,
    AIChatComment & { key: NodeKey; range: Anchor<Range> }
  >();
  const release = () => {
    members.forEach(({ anchor }) => anchor.release());
    members = [];
    selection?.release();
    selection = null;
    comments.forEach(({ range }) => range.release());
    comments.clear();
    cells.clear();
    references.clear();
  };
  const set = (next: AIChatOperation | null) => {
    operation = snapshot(next);
    publish(operation);
  };
  const fail = (error: unknown) => {
    if (operation) {
      set({
        ...operation,
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };
  const resolve = () => {
    for (const key of [
      ...cells.keys(),
      ...[...comments.values()].map((comment) => comment.key),
    ]) {
      const reference = references.get(key);
      const current =
        reference && view.read.nodes.get(key, { match: ElementApi.isElement });
      if (!reference || !current || !isEqual(reference.node, current[0])) {
        throw new Error('The AI target was deleted or edited.');
      }
    }
    const entries = members.map(({ key, node, anchor }) => {
      const path = anchor.resolve();
      const entry =
        path && view.read.nodes.get(path, { match: ElementApi.isElement });
      if (
        !entry ||
        view.key(entry[0]) !== key ||
        (cells.size === 0 && comments.size === 0 && !isEqual(entry[0], node))
      ) {
        throw new Error(
          'The AI target was deleted or edited. Discard this draft and select a new target.'
        );
      }
      return entry;
    });
    if (entries.length === 0) {
      throw new Error('Select a target before generating content.');
    }
    return entries;
  };
  const previewValue = (value: Value): Value => {
    if (value.length === 0) return value;
    let fitted = value;
    if (edit && mode === 'chat' && !nodeSelecting) {
      const range = selection?.resolve();
      if (!range) throw new Error('The AI selection no longer exists.');
      const entries = resolve();
      const first = entries[0][1][0];
      const last = entries.at(-1)?.[1][0];
      if (last === undefined) {
        throw new Error('The AI target no longer exists.');
      }
      view.read((state) =>
        state.transaction((tx) => {
          const previousLength = tx.children().length;
          if (!tx.fragment.replace(value, { at: range })) {
            throw new Error(
              'The generated content cannot fit the selected range.'
            );
          }
          const children = tx.children();
          fitted = children.slice(
            first,
            last + 1 + children.length - previousLength
          );
        })
      );
    }
    if (!edit) return fitted;
    const suggestion = editor.plugin(BaseSuggestionPlugin).api;
    suggestionIdentity ??= suggestion.createIdentity();
    const identity = suggestionIdentity;
    const preview = suggestion.diff(original, fitted, {
      getDeleteProps: (node) =>
        suggestion.getProps(node, { ...identity, suggestionDeletion: true }),
      getInsertProps: (node) => suggestion.getProps(node, identity),
      getUpdateProps: (node, properties, newProperties) =>
        suggestion.getProps(node, {
          ...identity,
          suggestionUpdate: {
            properties: Object.fromEntries(
              Object.entries(properties).filter(
                ([, property]) => property !== undefined
              )
            ),
            newProperties: Object.fromEntries(
              Object.entries(newProperties).filter(
                ([, property]) => property !== undefined
              )
            ),
          },
        }),
    });
    return preview.map((node, index) => {
      const previous = operation?.preview[index];
      return previous && isEqual(previous, node) ? previous : node;
    });
  };
  const receive = (id: number, source: string) => {
    if (
      operation?.id !== id ||
      operation.status !== 'streaming' ||
      operation.source === source
    ) {
      return;
    }
    try {
      const nodes = parser.update(source);
      if (!nodes.every((node) => ElementApi.isElement(node))) {
        throw new Error('The generated fragment must contain blocks.');
      }
      const value = nodes as Value;
      const preview = previewValue(value);
      set({ ...operation, source, value, preview });
    } catch (error) {
      fail(error);
    }
  };
  const previewReferences = () => {
    if (!operation) return;
    let preview: Value = [];
    view.read((state) =>
      state.transaction((tx) => {
        cells.forEach((children, key) =>
          tx.nodes.replaceChildren(children, { at: key })
        );
        for (const comment of comments.values()) {
          const range = comment.range.resolve();
          if (!range) {
            throw new Error('The comment selection no longer exists.');
          }
          tx.nodes.set(
            {
              [getCommentKey(comment.id)]: true,
              [editor.plugin(PLUGINS.comment).schema.key]: true,
            },
            { at: range, match: TextApi.isText, split: true }
          );
        }
        preview = members.map(({ anchor }) => {
          const path = anchor.resolve();
          const node =
            path && tx.nodes.get(path, { match: ElementApi.isElement })?.[0];
          if (!node) throw new Error('The AI target no longer exists.');
          return node;
        });
      })
    );
    set({
      ...operation,
      preview: preview as Value,
      comments: [...comments.values()].map(({ id, comment, content }) => ({
        id,
        comment,
        content,
      })),
    });
  };
  return {
    get current() {
      return operation;
    },
    start(options: {
      mode: 'chat' | 'insert';
      edit: boolean;
      retry?: boolean;
      references?: Reference[];
    }) {
      if (!options.retry) {
        release();
        const range = editor.read.selection();
        const root = editor.read.view.root() ?? SelectionApi.root(range);
        view = root ? createEditorView(editor, { root }) : editor;
        nodeSelecting = view.read.selection.nodes().length > 0;
        const entries = view.read.nodes.blocks({ mode: 'highest' });
        members = entries.map(([node, path]) => ({
          node,
          key: view.key(node),
          anchor: view.anchor(path, { deletion: 'drop' }),
        }));
        if (range) {
          selection = view.anchor(
            {
              anchor: { path: range.anchor.path, offset: range.anchor.offset },
              focus: { path: range.focus.path, offset: range.focus.offset },
            },
            { deletion: 'drop' }
          );
        }
        original = members.map(({ node }) => node);
        references = new Map(
          (options.references ?? []).map((reference) => [
            reference.key,
            reference,
          ])
        );
        ({ mode, edit } = options);
      }
      comments.forEach(({ range }) => range.release());
      comments.clear();
      cells.clear();
      parser = createMarkdownStream(editor);
      suggestionIdentity = undefined;
      snapshot = createPluginStateSnapshot();
      serial += 1;
      const id = serial;
      set({
        id,
        status: 'streaming',
        source: '',
        value: [],
        preview: [],
        targets: members.map(({ key }) => key),
        root: view.read.view.root(),
        partial: false,
        comments: [],
      });
      return id;
    },
    receive,
    tool(id: number, isEdit: boolean) {
      if (operation?.id !== id || operation.status !== 'streaming') return;
      edit = isEdit;
      try {
        set({ ...operation, preview: previewValue(operation.value) });
      } catch (error) {
        fail(error);
      }
    },
    table(id: number, key: NodeKey, source: string) {
      if (operation?.id !== id || operation.status !== 'streaming') return;
      try {
        const reference = references.get(key);
        if (!reference) throw new Error('Unknown AI table cell reference.');
        const value = editor
          .plugin(MarkdownPlugin)
          .api.deserialize(source).children;
        cells.set(key, value);
        resolve();
        previewReferences();
      } catch (error) {
        fail(error);
      }
    },
    comment(id: number, key: NodeKey, range: Range, comment: AIChatComment) {
      if (
        operation?.id !== id ||
        operation.status !== 'streaming' ||
        comments.has(comment.id)
      ) {
        return;
      }
      try {
        if (!references.has(key)) {
          throw new Error('Unknown AI comment reference.');
        }
        comments.set(comment.id, {
          ...comment,
          key,
          range: view.anchor(range, { deletion: 'drop' }),
        });
        resolve();
        previewReferences();
      } catch (error) {
        fail(error);
      }
    },
    finish(id: number, source?: string) {
      if (operation?.id !== id || operation.status !== 'streaming') return;
      if (source !== undefined) receive(id, source);
      if (operation?.status === 'streaming') {
        set({ ...operation, status: 'ready' });
      }
    },
    stop() {
      if (operation?.status === 'streaming') {
        set({ ...operation, status: 'ready', partial: true });
      }
    },
    error(id: number, error: unknown) {
      if (operation?.id === id && operation.status === 'streaming') fail(error);
    },
    discard() {
      serial += 1;
      release();
      set(null);
    },
    validate() {
      if (!operation || accepting) return;
      try {
        resolve();
      } catch (error) {
        fail(error);
      }
    },
    accept({
      placement = 'replace',
    }: { placement?: 'replace' | 'below' } = {}) {
      if (
        !operation ||
        operation.status !== 'ready' ||
        (operation.value.length === 0 &&
          cells.size === 0 &&
          comments.size === 0)
      ) {
        return false;
      }
      try {
        const entries = resolve();
        const { value } = operation;
        const validateDocument: (value: unknown) => void =
          editor.read.schema.assertDocument;
        if (value.length) validateDocument({ children: value });
        const range = selection?.resolve();
        if (
          !nodeSelecting &&
          !range &&
          cells.size === 0 &&
          comments.size === 0
        ) {
          throw new Error('The AI selection no longer exists.');
        }
        // Resolve every target before mutation. The request retains exact member
        // identities; intervening unselected blocks are never covered by a span.
        accepting = true;
        view.update({ history: 'new-batch' }, (tx) => {
          if (cells.size > 0 || comments.size > 0) {
            cells.forEach((children, key) =>
              tx.nodes.replaceChildren(children, { at: key })
            );
            for (const comment of comments.values()) {
              const commentRange = comment.range.resolve();
              if (!commentRange) {
                throw new Error('The comment selection no longer exists.');
              }
              tx.nodes.set(
                {
                  [getCommentKey(comment.id)]: true,
                  [editor.plugin(PLUGINS.comment).schema.key]: true,
                },
                { at: commentRange, match: TextApi.isText, split: true }
              );
            }
          } else if (placement === 'below' || mode === 'insert') {
            const last = entries.at(-1);
            if (!last) throw new Error('The AI target no longer exists.');
            const targetIndex = last[1].at(-1);
            if (targetIndex === undefined) {
              throw new Error('The AI target must be a block.');
            }
            const replaceEmpty =
              mode === 'insert' &&
              placement !== 'below' &&
              entries.length === 1 &&
              NodeApi.string(last[0]) === '';
            if (replaceEmpty) {
              tx.nodes.replaceChildren(value, {
                at: PathApi.parent(last[1]),
                index: targetIndex,
                count: 1,
              });
            } else {
              const at = PathApi.next(last[1]);
              tx.nodes.insert(value, { at });
            }
            const end = tx.points.end([
              ...PathApi.parent(last[1]),
              targetIndex + value.length - (replaceEmpty ? 1 : 0),
            ]);
            if (end) tx.selection.set({ anchor: end, focus: end });
          } else if (nodeSelecting) {
            const keys: NodeKey[] = [];
            for (let index = entries.length - 1; index >= 0; index--) {
              const path = entries[index][1];
              const targetIndex = path.at(-1);
              if (targetIndex === undefined) {
                throw new Error('The AI target must be a block.');
              }
              const nodes =
                index === entries.length - 1
                  ? value.slice(index)
                  : value.slice(index, index + 1);
              tx.nodes.replaceChildren(nodes, {
                at: PathApi.parent(path),
                index: targetIndex,
                count: 1,
              });
              for (let offset = 0; offset < nodes.length; offset++) {
                const node = tx.nodes.get(
                  [...PathApi.parent(path), targetIndex + offset],
                  { match: ElementApi.isElement }
                )?.[0];
                if (node) keys.unshift(tx.key(node));
              }
            }
            const selected = keys.flatMap((key) => {
              const entry = tx.nodes.get(key, { match: ElementApi.isElement });
              return entry ? [entry[0]] : [];
            });
            if (selected.length) tx.selection.setNodes(selected);
          } else if (range) {
            tx.selection.set(range);
            tx.fragment.replace(value);
          }
        });
        const acceptedComments = operation.comments;
        release();
        set(null);
        return { comments: acceptedComments };
      } catch (error) {
        fail(error);
        return false;
      } finally {
        accepting = false;
      }
    },
  };
};
