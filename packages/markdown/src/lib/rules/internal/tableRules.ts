import {
  type Descendant,
  ElementApi,
  type SlateEditor,
  type TElement,
  type TListElement,
  type TText,
  getPluginType,
  KEYS,
} from 'platejs';

import type {
  MdMdxJsxTextElement,
  MdParagraph,
  MdRootContent,
  MdTable,
  MdTableCell,
  MdTableRow,
} from '../../mdast';
import type { MdRules } from '../../types';

import {
  type DeserializeMdOptions,
  convertChildrenDeserialize,
} from '../../deserializer';
import {
  isNodeTypeAllowed,
  shouldDeserializeNode,
} from '../../deserializer/internal/shouldDeserializeNode';
import { buildMdastNode, convertNodesSerialize } from '../../serializer';
import { shouldSerializeNode } from '../../serializer/internal/shouldSerializeNode';
import { mdastToPlate } from '../../types';

const LEADING_SPACE_REGEX = /^ /;
const LIST_START_REGEX = /^\d+$/;
const TABLE_CELL_LIST_KEYS = ['li', 'ol', 'ul'];

const isMdxElementNamed = (node: any, names: string[]) =>
  (node?.type === 'mdxJsxTextElement' || node?.type === 'mdxJsxFlowElement') &&
  names.includes(node.name);

const isWhitespaceText = (node: any) =>
  node?.type === 'text' && node.value.trim() === '';

const getAttribute = (node: any, name: string) =>
  node.attributes.find((attribute: any) => attribute.name === name);

const hasOnlyAttributes = (node: any, names: string[]) =>
  node.attributes.every((attribute: any) => names.includes(attribute.name));

const isBareAttribute = (node: any, name: string) =>
  [undefined, null, 'true'].includes(getAttribute(node, name)?.value);

// `start` must be a positive integer the indent list can store.
const getListStart = (list: any) => {
  const start = getAttribute(list, 'start');

  if (!start) return 1;

  const value =
    typeof start.value === 'string' && LIST_START_REGEX.test(start.value)
      ? Number(start.value)
      : 0;

  return Number.isSafeInteger(value) && value >= 1 ? value : undefined;
};

const isTodoCheckbox = (node: any) =>
  isMdxElementNamed(node, ['input']) &&
  hasOnlyAttributes(node, ['checked', 'disabled', 'type']) &&
  getAttribute(node, 'type')?.value === 'checkbox' &&
  isBareAttribute(node, 'checked') &&
  isBareAttribute(node, 'disabled');

// Anything the indent list cannot hold exactly keeps the text fallback.
const isTableCellList = (node: any): node is MdMdxJsxTextElement =>
  isMdxElementNamed(node, ['ol', 'ul']) &&
  hasOnlyAttributes(node, node.name === 'ol' ? ['start'] : []) &&
  getListStart(node) !== undefined &&
  node.children.every(
    (item: any) =>
      isWhitespaceText(item) || isTableCellListItem(item, node.name === 'ul')
  );

const isTableCellListItem = (item: any, allowsTodo: boolean) => {
  if (!isMdxElementNamed(item, ['li']) || !hasOnlyAttributes(item, [])) {
    return false;
  }

  const firstListIndex = item.children.findIndex(isTableCellList);

  return item.children.every((child: any, index: number) =>
    isMdxElementNamed(child, ['input'])
      ? index === 0 && allowsTodo && isTodoCheckbox(child)
      : firstListIndex === -1 ||
        index <= firstListIndex ||
        isWhitespaceText(child) ||
        isTableCellList(child)
  );
};

// Each HTML ordered list numbers independently of earlier ones in its scope.
const isOrderedListAfterOrderedList = (nodes: any[], index: number) =>
  nodes[index]?.name === 'ol' &&
  nodes
    .slice(0, index)
    .some((node) => isTableCellList(node) && node.name === 'ol');

const deserializeTableCellList = (
  list: MdMdxJsxTextElement,
  deco: any,
  options: DeserializeMdOptions,
  indent = 1,
  isRestart = false
): Descendant[] => {
  if (!shouldDeserializeNode(list, options)) return [];

  const isOrdered = list.name === 'ol';
  const firstStart = getListStart(list)!;
  const listStyleType = getPluginType(
    options.editor!,
    isOrdered ? KEYS.ol : KEYS.ul
  );
  const items = list.children.filter((item) =>
    isMdxElementNamed(item, ['li'])
  ) as MdMdxJsxTextElement[];

  return items.flatMap((item, index) =>
    shouldDeserializeNode(item, options)
      ? deserializeTableCellListItem(item, deco, options, {
          indent,
          listRestart:
            isOrdered && index === 0 && isRestart ? firstStart : undefined,
          listRestartPolite:
            isOrdered && index === 0 && !isRestart && firstStart > 1
              ? firstStart
              : undefined,
          listStart: isOrdered ? firstStart + index : undefined,
          listStyleType,
        })
      : []
  );
};

const deserializeTableCellListItem = (
  item: MdMdxJsxTextElement,
  deco: any,
  options: DeserializeMdOptions,
  {
    indent,
    listRestart,
    listRestartPolite,
    listStart,
    listStyleType,
  }: {
    indent: number;
    listRestart?: number;
    listRestartPolite?: number;
    listStart?: number;
    listStyleType: string;
  }
): Descendant[] => {
  const [checkbox, ...afterCheckbox] = item.children;
  const isTodo = isTodoCheckbox(checkbox);
  const [firstText, ...rest] = afterCheckbox as any[];
  const todoChildren =
    firstText?.type === 'text'
      ? [
          {
            ...firstText,
            value: firstText.value.replace(LEADING_SPACE_REGEX, ''),
          },
          ...rest,
        ]
      : afterCheckbox;
  const inlineChildren = isTodo ? todoChildren : item.children;
  const paragraph: TListElement = {
    children: convertChildrenDeserialize(
      inlineChildren.filter((child) => !isTableCellList(child)) as any,
      deco,
      options
    ).map((child) =>
      (child as TText).text === '\u200B' ? { ...child, text: '' } : child
    ),
    indent,
    listStyleType: isTodo
      ? getPluginType(options.editor!, KEYS.listTodo)
      : listStyleType,
    type: getPluginType(options.editor!, KEYS.p),
  };

  if (isTodo) {
    paragraph.checked = (checkbox as MdMdxJsxTextElement).attributes.some(
      (attribute: any) => attribute.name === 'checked'
    );
  }
  if (listStart !== undefined) {
    paragraph.listStart = listStart;
  }
  if (listRestart !== undefined) {
    paragraph.listRestart = listRestart;
  }
  if (listRestartPolite !== undefined) {
    paragraph.listRestartPolite = listRestartPolite;
  }

  return [
    paragraph,
    ...item.children
      .filter(isTableCellList)
      .flatMap((nested, index, nestedLists) =>
        deserializeTableCellList(
          nested,
          deco,
          options,
          indent + 1,
          isOrderedListAfterOrderedList(nestedLists, index)
        )
      ),
  ];
};

const hasBlockChild = (editor: SlateEditor, nodes: Descendant[]) =>
  nodes.some((node) =>
    (node as TElement).children?.some(
      (child) => ElementApi.isElement(child) && !editor.api.isInline(child)
    )
  );

const deserializeTableCellChildren = (
  children: MdRootContent[],
  deco: any,
  options: DeserializeMdOptions
) => {
  if (
    !options.editor?.plugins.list ||
    // Cell lists become indent lists, so they also need the Markdown list
    // type to pass allowedNodes/disallowedNodes.
    !isNodeTypeAllowed(mdastToPlate(options.editor!, 'list'), options) ||
    TABLE_CELL_LIST_KEYS.some((key) => options.rules?.[key]) ||
    !children.some(isTableCellList)
  ) {
    return convertChildrenDeserialize(children, deco, options);
  }

  return children.flatMap((child, index) => {
    if (!isTableCellList(child)) {
      return convertChildrenDeserialize([child], deco, options);
    }

    const nodes = deserializeTableCellList(
      child,
      deco,
      options,
      1,
      isOrderedListAfterOrderedList(children, index)
    );

    return hasBlockChild(options.editor!, nodes)
      ? convertChildrenDeserialize([child], deco, options)
      : nodes;
  });
};

const toTableCellPhrasing = (nodes: any[]): MdTableCell['children'] =>
  nodes.map((node) => {
    if (node.type === 'break') return { type: 'html', value: '<br/>' };
    if (node.type === 'html') {
      return { ...node, value: node.value.replaceAll('\n', '') };
    }
    if (node.type === 'paragraph') {
      return { ...node, children: toTableCellPhrasing(node.children) };
    }

    return node;
  });

// Written as raw HTML so serializing does not require remark-mdx.
const serializeTableCellList = (
  items: TListElement[],
  options: Record<string, any>
): MdTableCell['children'] => {
  const tokens: MdTableCell['children'] = [];
  const openLists: { indent: number; name: string; nextStart: number }[] = [];
  const html = (value: string) => ({ type: 'html' as const, value });
  const closeList = () => {
    tokens.push(html(`</li></${openLists.pop()!.name}>`));
  };

  for (const item of items) {
    const { checked, indent, listRestart, listStart, listStyleType } = item;
    const name = listStyleType === KEYS.ol ? 'ol' : 'ul';

    while (openLists.length > 0 && openLists.at(-1)!.indent > indent) {
      closeList();
    }

    const top = openLists.at(-1);
    const continuesTop = top?.indent === indent && top.name === name;
    const start =
      listRestart ?? listStart ?? (continuesTop ? top.nextStart : 1);

    if (
      top?.indent === indent &&
      (!continuesTop ||
        (name === 'ol' &&
          (listRestart !== undefined || start !== top.nextStart)))
    ) {
      closeList();
    }
    if (openLists.at(-1)?.indent === indent) {
      tokens.push(html('</li><li>'));
    } else {
      const startAttribute =
        name === 'ol' && start !== 1 ? ` start="${start}"` : '';

      tokens.push(html(`<${name}${startAttribute}><li>`));
      openLists.push({ indent, name, nextStart: start });
    }
    openLists.at(-1)!.nextStart = start + 1;
    if (listStyleType === KEYS.listTodo) {
      tokens.push(
        html(
          checked
            ? '<input type="checkbox" checked disabled /> '
            : '<input type="checkbox" disabled /> '
        )
      );
    }

    const mdParagraph = buildMdastNode(item, options) as MdParagraph;

    tokens.push(...toTableCellPhrasing(mdParagraph.children));
  }
  while (openLists.length > 0) {
    closeList();
  }

  return tokens;
};

// Markdown tables don't support blocks, so cell blocks are joined with <br/>
// and list paragraphs are written as inline <ul>/<ol>.
const serializeTableCell = (
  node: TElement,
  options: Record<string, any>
): MdTableCell => {
  const pType = getPluginType(options.editor!, KEYS.p);
  const segments: { isList: boolean; children: MdTableCell['children'] }[] = [];
  let listItems: TListElement[] = [];

  const flushListItems = () => {
    if (listItems.length === 0) return;

    segments.push({
      children: serializeTableCellList(listItems, options),
      isList: true,
    });
    listItems = [];
  };

  for (const child of node.children as TElement[]) {
    if (child.type === pType && 'listStyleType' in child) {
      if (shouldSerializeNode(child, options)) {
        listItems.push(child as TListElement);
      }
      continue;
    }

    flushListItems();

    const blockChildren = convertNodesSerialize([child], options);

    if (blockChildren.length > 0) {
      segments.push({
        children: toTableCellPhrasing(blockChildren),
        isList: false,
      });
    }
  }
  flushListItems();

  const children: MdTableCell['children'] = [];

  segments.forEach((segment, index) => {
    if (index > 0 && !segment.isList && !segments[index - 1].isList) {
      children.push({ type: 'html', value: '<br/>' });
    }
    children.push(...segment.children);
  });

  return { children, type: 'tableCell' };
};

export const tableRules: MdRules = {
  table: {
    deserialize: (node, deco, options) => {
      const paragraphType = getPluginType(options.editor!, KEYS.p);
      const rows =
        node.children?.map((row, rowIndex) => ({
          children:
            row.children?.map((cell) => {
              const cellType = rowIndex === 0 ? 'th' : 'td';

              const cellChildren = deserializeTableCellChildren(
                cell.children,
                deco,
                options
              );
              const groupedChildren: any[] = [];
              let currentParagraphChildren: any[] = [];

              for (const child of cellChildren) {
                // Text nodes or inline elements should be grouped into paragraphs
                if (
                  !child.type ||
                  child.type === KEYS.inlineEquation ||
                  options.editor!.api.isInline(child)
                ) {
                  currentParagraphChildren.push(child);
                } else {
                  // Block-level elements should end the current paragraph and be added directly
                  if (currentParagraphChildren.length > 0) {
                    groupedChildren.push({
                      children: currentParagraphChildren,
                      type: paragraphType,
                    });
                    currentParagraphChildren = [];
                  }
                  groupedChildren.push(child);
                }
              }

              // Add any remaining paragraph child elements
              if (currentParagraphChildren.length > 0) {
                groupedChildren.push({
                  children: currentParagraphChildren,
                  type: paragraphType,
                });
              }

              return {
                children:
                  groupedChildren.length > 0
                    ? groupedChildren
                    : [{ children: [{ text: '' }], type: paragraphType }],
                type: getPluginType(options.editor!, cellType),
              };
            }) || [],
          type: getPluginType(options.editor!, KEYS.tr),
        })) || [];

      return {
        children: rows,
        type: getPluginType(options.editor!, KEYS.table),
      };
    },
    serialize: (node, options) => ({
      children: convertNodesSerialize(
        node.children,
        options
      ) as MdTable['children'],
      type: 'table',
    }),
  },
  td: {
    serialize: serializeTableCell,
  },
  th: {
    serialize: serializeTableCell,
  },
  tr: {
    serialize: (node, options) => ({
      children: convertNodesSerialize(
        node.children,
        options
      ) as MdTableRow['children'],
      type: 'tableRow',
    }),
  },
};
