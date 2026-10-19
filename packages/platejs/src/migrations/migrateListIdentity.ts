import { nanoid } from 'nanoid';

import {
  type Descendant,
  type EditorDocumentValue,
  type Element,
  ElementApi,
  type Value,
} from '../facade';
import { BaseHeadingPlugin } from '../features/basic-nodes';
import type { DocumentMigration } from './documentMigrations';
import { getMigrationBinding } from './documentMigrationTarget.internal';

const LIST_TYPES = new Set<unknown>(['bulleted', 'numbered', 'task']);

const indentOf = (element: Element) =>
  typeof element.indent === 'number' ? element.indent : 1;

const styleOf = (element: Element) =>
  (element.listType === 'numbered' && element.listStyle === 'decimal') ||
  (element.listType === 'bulleted' && element.listStyle === 'disc')
    ? undefined
    : element.listStyle;

const listIdOf = (element: Element) =>
  typeof element.listId === 'string' ? element.listId : undefined;

/**
 * Give every list item a stored `listId`, so a document saved before list
 * identity keeps its numbers once numbering follows ids. A list there was a
 * run of sibling items of one kind, style and heading role at one indent,
 * walking past deeper blocks and ending at any other block at that indent or
 * above. An item without an id takes the nearest id held before it in its run,
 * else the run's first held id, else one fresh id for the run. Running the
 * step again changes nothing.
 */
export const migrateListIdentity: DocumentMigration = ({
  document,
  target,
}) => {
  const headingType = getMigrationBinding(
    target,
    BaseHeadingPlugin
  )?.elementType;
  const sameRun = (previous: Element, element: Element) =>
    previous.listType === element.listType &&
    styleOf(previous) === styleOf(element) &&
    (previous.type === headingType) === (element.type === headingType);

  const migrateChildren = (
    children: readonly Descendant[]
  ): readonly Descendant[] => {
    const runs: Element[][] = [];
    const runByIndent = new Map<number, Element[]>();

    for (const node of children) {
      if (!ElementApi.isElement(node)) continue;

      const indent = indentOf(node);

      for (const runIndent of runByIndent.keys()) {
        if (runIndent > indent) runByIndent.delete(runIndent);
      }
      if (!LIST_TYPES.has(node.listType)) {
        runByIndent.delete(indent);

        continue;
      }

      let run = runByIndent.get(indent);
      const previous = run?.at(-1);

      if (!run || !previous || !sameRun(previous, node)) {
        run = [];
        runs.push(run);
        runByIndent.set(indent, run);
      }
      run.push(node);
    }

    const assigned = new Map<Element, string>();

    for (const run of runs) {
      let id = run.map(listIdOf).find(Boolean) ?? nanoid(10);

      for (const item of run) {
        const held = listIdOf(item);

        if (held) id = held;
        else assigned.set(item, id);
      }
    }

    let changed = false;
    const next = children.map((node) => {
      if (!ElementApi.isElement(node)) return node;

      const listId = assigned.get(node);
      const nested = migrateChildren(node.children);

      if (listId === undefined && nested === node.children) return node;

      changed = true;

      return {
        ...node,
        ...(listId === undefined ? {} : { listId }),
        children: nested,
      };
    });

    return changed ? next : children;
  };

  const source = document as EditorDocumentValue;
  const children = migrateChildren(source.children) as Value;
  let { roots } = source;

  if (roots) {
    let changed = false;
    const next: Record<string, Value> = {};

    for (const [root, rootChildren] of Object.entries(roots)) {
      next[root] = migrateChildren(rootChildren) as Value;
      if (next[root] !== rootChildren) changed = true;
    }
    if (changed) roots = next;
  }

  if (children === source.children && roots === source.roots) {
    return { document: source };
  }

  return {
    document: { ...source, children, ...(roots ? { roots } : {}) },
  };
};
