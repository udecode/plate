import isEqual from 'lodash/isEqual.js';

import {
  getCompiledEditorSchemaFromApi,
  NodeApi,
  type EditorUpdateTransaction,
  type Element,
  type NodeEntry,
} from '../../facade';
import type {
  BlockInsertOptions,
  BlockUpsertOptions,
} from '../../lib/editor/pluginRuntimeTypes';
import { getPlateModelPublication } from './compilePlateModel';

type BlockInsertionMode = 'insert' | 'upsert';

type ApplyBlockInsertionOptions<TResult> = Readonly<{
  insert: (options: BlockInsertOptions) => TResult;
  matches: (block: Element) => boolean;
  mode: BlockInsertionMode;
  onReuse?: (entry: NodeEntry<Element>) => TResult;
  options?: BlockInsertOptions | BlockUpsertOptions;
  tx: EditorUpdateTransaction;
}>;

const isReplaceableEmptyBlock = (tx: EditorUpdateTransaction, block: Element) =>
  NodeApi.isText(block.children[0]) &&
  !tx.schema.isReadOnly(block) &&
  tx.nodes.isEmpty(block);

const selectBlockStart = (
  tx: EditorUpdateTransaction,
  [, path]: NodeEntry<Element>
) => {
  const point = tx.points.start(path);

  if (point) tx.selection.set(point);
};

export const applyBlockInsertion = <TResult>({
  insert,
  matches,
  mode,
  onReuse,
  options = {},
  tx,
}: ApplyBlockInsertionOptions<TResult>): TResult | undefined => {
  const insertOptions = options as BlockInsertOptions;

  if (insertOptions.before !== undefined) {
    const target = tx.nodes.get(insertOptions.before);
    if (!target) return undefined;
    const { after: _after, before: _before, ...beforeOptions } = insertOptions;

    return insert({
      ...beforeOptions,
      at: target[1],
      replaceEmpty: false,
    });
  }

  if (
    mode === 'insert' &&
    ((insertOptions.at !== undefined && insertOptions.after === undefined) ||
      insertOptions.replaceEmpty !== undefined)
  ) {
    return insert(insertOptions);
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

  if (insertOptions.select) selectBlockStart(tx, source);

  return onReuse?.(source);
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
