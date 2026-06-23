import type {
  EditorStateView,
  EditorUpdateTransaction,
  NodeEntry,
  NodeInsertNodesOptions,
} from '@platejs/plite';

import {
  ElementApi,
  type BasePlateEditor,
  type TLinkElement,
  isDefined,
  NodeApi,
  RangeApi,
} from 'platejs';
import { KEYS } from 'platejs';

import { type CreateLinkNodeOptions, validateUrl } from '../utils';
import { insertLink } from './insertLink';
import { unwrapLink } from './unwrapLink';
import { upsertLinkText } from './upsertLinkText';
import { wrapLink } from './wrapLink';

type InsertNodesOptions = NonNullable<NodeInsertNodesOptions<TLinkElement>>;

type UnwrapNodesOptions = NonNullable<
  Parameters<EditorUpdateTransaction['nodes']['unwrap']>[0]
>;

type WrapNodesOptions = NonNullable<
  Parameters<EditorUpdateTransaction['nodes']['wrap']>[1]
>;

type RuntimeReadableLinkEditor = BasePlateEditor & {
  read: <T>(fn: (state: EditorStateView) => T) => T;
};

const readEditor = <T>(
  editor: BasePlateEditor,
  fn: (state: EditorStateView) => T
) => (editor as RuntimeReadableLinkEditor).read(fn);

export type UpsertLinkOptions = {
  insertNodesOptions?: InsertNodesOptions;
  /** If true, insert text when selection is in url. */
  insertTextInLink?: boolean;
  skipValidation?: boolean;
  unwrapNodesOptions?: UnwrapNodesOptions;
  wrapNodesOptions?: WrapNodesOptions;
} & CreateLinkNodeOptions;

/**
 * If selection in a link or is not url:
 *
 * - Insert text with url, exit If selection is expanded or `update` in a link:
 * - Remove link node, get link text Then:
 * - Insert link node
 */
export const upsertLink = (
  editor: BasePlateEditor,
  {
    insertNodesOptions,
    insertTextInLink,
    skipValidation = false,
    target,
    text,
    url,
  }: UpsertLinkOptions
) => {
  const at = editor.selection;

  if (!at) return;

  const linkType = editor.getType(KEYS.link);
  const matchLink = (node: unknown) =>
    ElementApi.isElement(node) && node.type === linkType;
  const linkAbove = editor.api.above({
    at,
    match: matchLink,
  }) as NodeEntry<TLinkElement> | undefined;

  // anchor and focus in link -> insert text
  if (insertTextInLink && linkAbove) {
    // we don't want to insert marks in links
    editor.update((tx) => {
      tx.text.insert(url);
    });

    return true;
  }
  if (!skipValidation && !validateUrl(editor, url)) return;
  if (isDefined(text) && text.length === 0) {
    text = url;
  }
  // edit the link url and/or target
  if (linkAbove) {
    if (url !== linkAbove[0]?.url || target !== linkAbove[0]?.target) {
      editor.update((tx) => {
        tx.nodes.set<TLinkElement>(
          { target, url },
          {
            at: linkAbove[1],
          }
        );
      });
    }

    upsertLinkText(editor, { target, text, url });

    return true;
  }

  // selection contains at one edge edge or between the edges
  const linkEntry = editor.api.node({
    at,
    match: matchLink,
  }) as NodeEntry<TLinkElement> | undefined;

  const [linkNode] = linkEntry ?? [];

  if (RangeApi.isExpanded(at)) {
    unwrapLink(editor, {
      split: true,
    });

    wrapLink(editor, {
      target,
      url,
    });

    upsertLinkText(editor, { target, text, url });

    return true;
  }

  const props = linkNode ? NodeApi.extractProps(linkNode) : {};

  const path = editor.selection?.focus.path;

  if (!path) return;

  // link text should have the focused leaf marks
  const leaf =
    editor.api.leaf?.(path)?.[0] ??
    readEditor(editor, (state) => state.nodes.leaf(path)?.[0]);

  // if text is empty, text is url
  if (!text?.length) {
    text = url;
  }

  insertLink(
    editor,
    {
      ...props,
      children: [
        {
          ...leaf,
          text,
        },
      ],
      target,
      url,
    },
    insertNodesOptions
  );

  return true;
};
