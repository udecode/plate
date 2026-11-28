import {
  BaseParagraphPlugin,
  TextApi,
  type Descendant,
  type EditorDocumentValue,
  type Element,
  type RootKey,
} from '../../../core';
import type {
  MarkdownMappingDiagnosticInput,
  MarkdownOmittedPropertyInput,
} from '../../../lib/plugin/PluginFormatContext';
import { createListId } from './listIdentity.internal';
import { getDocumentListOrdinal } from './listIndex.internal';

export const encodeListPlainText = ({
  children,
  document,
  node,
  root,
}: {
  children: string;
  document: EditorDocumentValue;
  node: Element;
  root: RootKey;
}) => {
  if (!node.listType) return undefined;

  const indent =
    'indent' in node && typeof node.indent === 'number' ? node.indent : 1;
  const depth = Math.max(0, indent - 1);
  const marker =
    node.listType === 'task'
      ? `- [${node.checked ? 'x' : ' '}]`
      : node.listType === 'numbered'
        ? `${getDocumentListOrdinal(document, root, node)}.`
        : '-';

  return `${'  '.repeat(depth)}${marker} ${children}`;
};

type MdastListChild = { type: string };

type MdastListNode<TChild extends MdastListChild = MdastListChild> = {
  children: Array<{
    checked?: boolean | null;
    children: TChild[];
  }>;
  ordered?: boolean | null;
  start?: number | null;
  type: 'list';
};

export const decodeListMarkdown = <TChild extends MdastListChild>({
  build,
  isInline,
  node,
  registry,
  report,
  schema: schemaView,
}: {
  build: (child: TChild) => Descendant[];
  isInline: (child: Element) => boolean;
  node: MdastListNode<TChild>;
  registry: {
    type: (plugin: typeof BaseParagraphPlugin) => string | undefined;
  };
  report: (
    diagnostic: MarkdownMappingDiagnosticInput | MarkdownOmittedPropertyInput
  ) => void;
  schema: {
    element: (
      type: string
    ) => { behavior?: { object?: boolean; void?: boolean } } | null;
    property: (input: {
      key: string;
      placement: 'element';
      type: string;
    }) => unknown;
  };
}): Element[] => {
  const type = registry.type(BaseParagraphPlugin);

  if (!type) {
    throw new Error('List Markdown decoding requires paragraphs.');
  }
  // One report per lost property and block type in a list: every
  // report carries the whole list's source.
  const reported = new Set<string>();
  const reportOnce = (
    loss: string,
    diagnostic: MarkdownMappingDiagnosticInput | MarkdownOmittedPropertyInput
  ) => {
    if (reported.has(loss)) return;
    reported.add(loss);
    report(diagnostic);
  };
  const fits = (key: string, blockType: string) =>
    schemaView.property({
      key,
      placement: 'element',
      type: blockType,
    }) !== null;
  const toBlocks = (nodes: readonly Descendant[]) => {
    const blocks: Element[] = [];
    let run: Descendant[] = [];
    const flushRun = () => {
      if (run.length > 0) blocks.push({ children: run, type });
      run = [];
    };

    nodes.forEach((child) => {
      if (TextApi.isText(child) || isInline(child)) {
        run.push(child);
        return;
      }
      flushRun();
      blocks.push(child);
    });
    flushRun();

    return blocks;
  };
  const withAllowedProperties = (
    block: Element,
    properties: Readonly<Record<string, unknown>>
  ): Element => ({
    ...block,
    ...Object.fromEntries(
      Object.entries(properties).filter(([key]) => {
        if (fits(key, block.type)) return true;
        reportOnce(`${key}:${block.type}`, {
          key,
          message: `List Markdown omitted property "${key}" on "${block.type}": the schema does not allow it.`,
        });

        return false;
      })
    ),
  });
  // A text block the list cannot hold becomes the item's paragraph, as
  // HTML reads it, so the item keeps its place and number. Any other
  // block leaves the list and stays among its parent item's blocks.
  const toItem = (
    block: Element,
    indent: number,
    listProperties: Readonly<Record<string, unknown>>
  ): Element => {
    const properties = { indent, ...listProperties };

    if (block.type === type || fits('listType', block.type)) {
      return withAllowedProperties(block, properties);
    }

    const behavior = schemaView.element(block.type)?.behavior;
    const textBlock =
      behavior !== undefined &&
      !behavior.object &&
      !behavior.void &&
      block.children.every((child) => TextApi.isText(child) || isInline(child));

    if (textBlock) {
      reportOnce(`item:${block.type}`, {
        action: 'replaced',
        kind: 'element',
        message: `List Markdown replaced "${block.type}" with "${type}": the list cannot hold it.`,
        nodeType: node.type,
      });

      return withAllowedProperties(
        { children: block.children, type },
        properties
      );
    }
    reportOnce(`item:${block.type}`, {
      action: 'unwrapped',
      kind: 'element',
      message: `List Markdown unwrapped "${block.type}" from its list item: the list cannot hold it.`,
      nodeType: node.type,
    });

    return indent > 1 ? withAllowedProperties(block, { indent }) : block;
  };
  const parseList = (
    list: MdastListNode<TChild>,
    indent: number,
    listId: string
  ): Element[] => {
    const items: Element[] = [];
    const ordered = Boolean(list.ordered);
    const start = list.start ?? 1;

    list.children.forEach((listItem, index) => {
      const { checked } = listItem;
      const task = typeof checked === 'boolean';
      const listType = task ? 'task' : ordered ? 'numbered' : 'bulleted';

      const [first, ...rest] = listItem.children;
      const opensWithList = first?.type === 'list';
      const nested = opensWithList ? listItem.children : rest;
      const [head = { children: [{ text: '' }], type }, ...continuation] =
        first && !opensWithList ? toBlocks(build(first)) : [];

      items.push(
        toItem(head, indent, {
          ...(task ? { checked } : {}),
          listId,
          listType,
          ...(ordered && start !== 1 && index === 0
            ? { listStart: start }
            : {}),
        })
      );
      continuation.forEach((block) => {
        items.push(withAllowedProperties(block, { indent: indent + 1 }));
      });

      let sublists = 0;

      nested.forEach((child) => {
        if (child.type === 'list') {
          sublists += 1;
          items.push(
            ...parseList(
              child as unknown as MdastListNode<TChild>,
              indent + 1,
              sublists === 1 ? listId : createListId()
            )
          );
          return;
        }

        toBlocks(build(child)).forEach((block) => {
          items.push(withAllowedProperties(block, { indent: indent + 1 }));
        });
      });
    });

    return items;
  };

  return parseList(node, 1, createListId());
};
