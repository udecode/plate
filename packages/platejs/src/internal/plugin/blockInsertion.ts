import isEqual from 'lodash/isEqual.js';

import {
  getCompiledEditorSchemaFromApi,
  NodeApi,
  type Editor,
  type EditorUpdateTransaction,
  type Element,
  type NodeKey,
} from '../../facade';
import type {
  BlockInsertOptions,
  BlockUpsertOptions,
} from '../../lib/editor/pluginRuntimeTypes';
import {
  getPlateModelPublication,
  isPlateBlockContent,
} from './compilePlateModel';
import { getCaretAnchor } from './insertionAnchor';

type BlockInsertionMode = 'insert' | 'upsert';

type ApplyBlockInsertionOptions = Readonly<{
  editor: Editor;
  insert: (options: BlockInsertOptions) => boolean;
  matches: (block: Element) => boolean;
  mode: BlockInsertionMode;
  onReuse?: (block: Element, key: NodeKey) => void;
  options?: BlockInsertOptions | BlockUpsertOptions;
  tx: EditorUpdateTransaction;
}>;

/** An empty structural block, such as a Details title, keeps its slot. */
export const isReplaceableEmptyBlock = (
  tx: Pick<EditorUpdateTransaction, 'nodes' | 'schema'>,
  block: Element
) =>
  NodeApi.isText(block.children[0]) &&
  isPlateBlockContent(tx.schema, block) &&
  !tx.schema.isReadOnly(block) &&
  tx.nodes.isEmpty(block);

export const applyBlockInsertion = ({
  editor,
  insert,
  matches,
  mode,
  onReuse,
  options = {},
  tx,
}: ApplyBlockInsertionOptions): boolean => {
  if (options.before !== undefined || options.at !== undefined) {
    return insert(options);
  }

  const anchor =
    options.after === undefined ? getCaretAnchor(editor, tx) : undefined;
  const insertOptions = anchor ? { ...options, after: anchor } : options;

  if (mode === 'insert' && insertOptions.replaceEmpty !== undefined) {
    const target = insertOptions.replaceEmpty
      ? tx.nodes.block({ at: insertOptions.after })
      : undefined;

    return insert(
      target && !isReplaceableEmptyBlock(tx, target[0])
        ? { ...insertOptions, replaceEmpty: false }
        : insertOptions
    );
  }

  const source = tx.nodes.block({ at: insertOptions.after });

  if (!source || !isReplaceableEmptyBlock(tx, source[0])) {
    return insert({ ...insertOptions, replaceEmpty: false });
  }

  if (!matches(source[0])) {
    return insert({ ...insertOptions, replaceEmpty: true });
  }

  if (mode === 'insert') {
    return insert({ ...insertOptions, replaceEmpty: false });
  }

  const key = tx.key(source[0]);

  if (insertOptions.select) {
    const point = tx.points.start(key);

    if (point) tx.selection.set(point);
  }
  onReuse?.(source[0], key);

  return true;
};

const propertyKeys = (
  key: string | Readonly<{ prefix: string }>,
  source: Element,
  target: Element
) => {
  if (typeof key === 'string') return [key];

  return [...new Set([...Object.keys(source), ...Object.keys(target)])].filter(
    (candidate) => candidate.startsWith(key.prefix)
  );
};

export const matchesGeneratedBlockInsertion = ({
  editor,
  pluginName,
  properties,
  source,
  target,
  tx,
}: Readonly<{
  editor: Parameters<typeof getPlateModelPublication>[0];
  pluginName: string;
  properties: Readonly<Record<string, unknown>>;
  source: Element;
  target: Element;
  tx: EditorUpdateTransaction;
}>) => {
  if (typeof target.type !== 'string' || source.type !== target.type) {
    return false;
  }

  const schema = getCompiledEditorSchemaFromApi(tx.schema);
  const element = schema?.elements.byType.get(target.type);

  if (!schema || !element) return false;

  const publication = getPlateModelPublication(editor);
  const explicitKeys = new Set(Object.keys(properties));

  for (const propertyId of element.construction.propertyIds) {
    const property = schema.properties.byId.get(propertyId);

    if (!property) continue;

    const keys = propertyKeys(property.key, source, target);
    const ownerDefinesInsertion =
      property.owner !== pluginName &&
      publication?.updateMethods[property.owner]?.includes('insert') === true;

    for (const key of keys) {
      if (!explicitKeys.has(key) && !ownerDefinesInsertion) continue;
      if (!isEqual(source[key], target[key])) return false;
    }
  }

  return true;
};
