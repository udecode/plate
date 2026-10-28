import { getEditorSchema } from '../../core/editor-runtime';
import { getCompiledEditorSchema } from '../../core/plugin-registry';
import { canonicalRecordJson, type RecordOps } from '../../core/record-store';
import { completeChildrenAt } from '../../core/representation';
import type {
  CompiledEditorSchema,
  CompiledSchemaContentProgram,
} from '../../core/schema-compiler';
import { areEditorJsonValuesEqual } from '../../core/value-codec';
import { countCoreWork } from '../../core/work';
import type { AnyEditor as Editor } from '../../interfaces/editor';
import { ElementApi, type Element } from '../../interfaces/element';
import type { Descendant } from '../../interfaces/node';
import { parseReserve, RESERVES, reserveIdOf } from '../facts/records';
import { heldNode } from './holds';
import { readMembers, withMembers } from './marks';
import { storesSpares } from './reserves';
import {
  type Spare,
  slotKeyOf,
  spareKeyOf,
  sparesIn,
  takeSpare,
  withBuiltSpares,
} from './spares';

/**
 * `children` completed at `site` as the canonical pass completes them, each
 * build taking its slot's unbuilt spare as a decision does, and the keys of
 * the slots whose spares the builds took. Null when no build took one.
 */
const completeFromSpares = (
  editor: Editor,
  schema: CompiledEditorSchema,
  site: readonly Element[],
  children: readonly Descendant[],
  root: string,
  spares: readonly Spare[]
) => {
  const [parentType = null, ...outerTypes] = site.map(
    (element) => element.type
  );
  const used = new Set<string>();
  const taken = new Map<string, string>();
  const completion = completeChildrenAt(
    editor,
    site,
    children,
    root,
    undefined,
    undefined,
    (nodeType, slot) => {
      const spare = takeSpare(spares, parentType, nodeType, slot, used);

      if (!spare) return null;
      taken.set(slotKeyOf(slot), spare.key);

      return heldNode(schema, spare.node, { outerTypes, parentType, root });
    }
  );
  const keys = new Set(
    completion.built.flatMap(({ slot }) => taken.get(slotKeyOf(slot)) ?? [])
  );

  return keys.size > 0 ? { children: completion.children, keys } : null;
};

const satisfiesContent = (
  editor: Editor,
  content: CompiledSchemaContentProgram,
  blocks: readonly Descendant[],
  site: readonly Element[],
  root: string
) =>
  blocks.length >= content.min &&
  (content.prefix ?? []).every((slot, index) => {
    const child = blocks[index];

    return (
      ElementApi.isElement(child) &&
      child.type === slot.type &&
      Object.entries(slot.properties).every(([key, value]) =>
        areEditorJsonValuesEqual(
          getEditorSchema(editor).getProperty(child, key, {
            ancestors: site,
            root,
          }),
          value
        )
      )
    );
  });

const lackingChildren = (
  editor: Editor,
  content: CompiledSchemaContentProgram | null,
  children: readonly Descendant[],
  site: readonly Element[],
  root: string
) => {
  if (!content) return null;

  const blocks = content.allowsText
    ? children
    : children.filter((child) => ElementApi.isElement(child));

  return satisfiesContent(editor, content, blocks, site, root) ? null : blocks;
};

const spareNode = (
  editor: Editor,
  schema: CompiledEditorSchema,
  node: Descendant,
  ancestors: readonly Element[],
  root: string
): Descendant => {
  if (!ElementApi.isElement(node)) return node;

  const site = [node, ...ancestors];
  let changed = false;
  const children = node.children.map((child) => {
    const spared = spareNode(editor, schema, child, site, root);

    changed ||= spared !== child;

    return spared;
  });
  const lacking = lackingChildren(
    editor,
    getEditorSchema(editor).getElementContent(node.type),
    children,
    site,
    root
  );

  if (lacking) countCoreWork('spareReads');

  const spares = lacking ? sparesIn(node).filter((spare) => !spare.built) : [];
  const built =
    lacking && spares.length > 0
      ? completeFromSpares(editor, schema, site, lacking, root, spares)
      : null;

  if (built) {
    return withMembers(
      { ...node, children: built.children },
      withBuiltSpares(readMembers(node), built.keys)
    );
  }

  return changed ? { ...node, children } : node;
};

export const spareBlock = (
  editor: Editor,
  root: string,
  block: Descendant
): Descendant => {
  const schema = getCompiledEditorSchema(editor);

  return storesSpares(schema)
    ? spareNode(editor, schema, block, [], root)
    : block;
};

export const spareRoot = (
  editor: Editor,
  root: string,
  children: readonly Descendant[],
  records: (set: string) => Iterable<readonly [string, unknown]>
): Readonly<{ children: readonly Descendant[]; records: RecordOps }> | null => {
  const schema = getCompiledEditorSchema(editor);

  if (!storesSpares(schema)) return null;

  let changed = false;
  const blocks = children.map((child) => {
    const spared = spareNode(editor, schema, child, [], root);

    changed ||= spared !== child;

    return spared;
  });
  const lacking = lackingChildren(
    editor,
    getEditorSchema(editor).getRootContent(root),
    blocks,
    [],
    root
  );
  const reserves = lacking
    ? [...records(RESERVES)].flatMap(([id, json]) => {
        countCoreWork('spareReads');

        const record = typeof json === 'string' ? parseReserve(id, json) : null;

        return record && record.root === root && !record.built ? [record] : [];
      })
    : [];
  const built =
    lacking && reserves.length > 0
      ? completeFromSpares(
          editor,
          schema,
          [],
          lacking,
          root,
          reserves.map((record) => ({ ...record, type: null }))
        )
      : null;

  if (!built) return changed ? { children: blocks, records: new Map() } : null;

  const ops = new Map<string, string | null>();

  for (const record of reserves) {
    if (!built.keys.has(spareKeyOf({ slot: record.slot, type: null }))) {
      continue;
    }

    const done = { ...record, built: true as const };

    ops.set(reserveIdOf(record), null);
    ops.set(reserveIdOf(done), canonicalRecordJson(done));
  }

  return { children: built.children, records: new Map([[RESERVES, ops]]) };
};
