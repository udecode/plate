import type {
  Descendant,
  EditorDocumentValue,
  EditorSchemaRepairCode,
  Element,
  RootKey,
  Value,
} from '../../interfaces';

export type EditorSchemaModelLocation = Readonly<{
  path: readonly number[];
  property?: string;
  root: RootKey;
}>;

export type EditorSchemaRepair = Readonly<{
  code: EditorSchemaRepairCode;
  impact: 'lossless' | 'lossy';
  inputs: readonly EditorSchemaModelLocation[];
  outputs: readonly EditorSchemaModelLocation[];
  owner: 'document' | 'grammar' | 'property' | 'representation';
}>;

export type EditorSchemaFitReport<V extends Value = Value> = Readonly<{
  document: EditorDocumentValue<V>;
  repairs: readonly EditorSchemaRepair[];
}>;

export type RootCanonicalizationPass = Readonly<{
  input: readonly Descendant[];
  output: readonly Descendant[];
}>;

export const schemaModelLocation = (
  root: RootKey,
  path: readonly number[],
  property?: string
): EditorSchemaModelLocation =>
  Object.freeze({
    path: Object.freeze([...path]),
    ...(property === undefined ? {} : { property }),
    root,
  });

export const schemaRepair = (
  repair: Readonly<{
    code: EditorSchemaRepairCode;
    impact: EditorSchemaRepair['impact'];
    inputs?: readonly EditorSchemaModelLocation[];
    outputs?: readonly EditorSchemaModelLocation[];
    owner: EditorSchemaRepair['owner'];
  }>
): EditorSchemaRepair =>
  Object.freeze({
    code: repair.code,
    impact: repair.impact,
    inputs: Object.freeze([...(repair.inputs ?? [])]),
    outputs: Object.freeze([...(repair.outputs ?? [])]),
    owner: repair.owner,
  });

export class EditorSchemaFitRepairCollector {
  readonly #order: RootKey[] = [];
  readonly #repairs = new Map<RootKey, readonly EditorSchemaRepair[]>();

  replaceRoot(root: RootKey, repairs: readonly EditorSchemaRepair[]) {
    if (!this.#repairs.has(root)) this.#order.push(root);
    this.#repairs.set(root, Object.freeze([...repairs]));
  }

  snapshot() {
    return Object.freeze(
      this.#order.flatMap((root) => this.#repairs.get(root) ?? [])
    );
  }
}

type RepresentationRepairContext = Readonly<{
  getElementContent: (type: string) => unknown;
  getElementType: (element: Readonly<{ type?: unknown }>) => string | null;
  getRootContent: (root?: RootKey) => unknown;
  isInline: (element: Element) => boolean;
  nodePropertiesEqual: (
    left: Readonly<Record<string, unknown>>,
    right: Readonly<Record<string, unknown>>,
    contentKey: 'children' | 'text',
    rightKeys: readonly string[]
  ) => boolean;
  structurallyEqual: (left: unknown, right: unknown) => boolean;
}>;

type RepresentationEntry = Readonly<{
  children?: readonly RepresentationEntry[];
  node: Descendant;
  sources: readonly EditorSchemaModelLocation[];
}>;

const isText = (
  node: Descendant | undefined
): node is Extract<Descendant, { text: string }> =>
  node !== undefined && Object.hasOwn(node, 'text');

const isElement = (node: Descendant | undefined): node is Element =>
  node !== undefined && Object.hasOwn(node, 'children');

const textPropertiesEqual = (
  left: Extract<Descendant, { text: string }>,
  right: Extract<Descendant, { text: string }>,
  context: RepresentationRepairContext
) =>
  context.nodePropertiesEqual(
    left,
    right,
    'text',
    Object.keys(right).filter((key) => key !== 'text')
  ) &&
  context.nodePropertiesEqual(
    right,
    left,
    'text',
    Object.keys(left).filter((key) => key !== 'text')
  );

/**
 * Classify the representation-only pass around a forced root fit.
 *
 * The classifier reconstructs the canonical output from the actions it
 * reports. Any remaining difference throws instead of silently losing a
 * diagnostic.
 */
export const collectRepresentationRepairs = (
  input: readonly Descendant[],
  output: readonly Descendant[],
  root: RootKey,
  context: RepresentationRepairContext
): readonly EditorSchemaRepair[] => {
  if (context.structurallyEqual(input, output)) return Object.freeze([]);

  const repairs: EditorSchemaRepair[] = [];
  const classifyChildren = (
    children: readonly Descendant[],
    parent: Element | null,
    path: readonly number[]
  ): readonly RepresentationEntry[] => {
    const entries = children.map((child, index): RepresentationEntry => {
      const childPath = [...path, index];

      if (isText(child)) {
        return {
          node: child,
          sources: [schemaModelLocation(root, childPath)],
        };
      }
      const nested = classifyChildren(child.children, child, childPath);
      const nestedNodes = nested.map(({ node }) => node);
      const node = context.structurallyEqual(child.children, nestedNodes)
        ? child
        : ({ ...child, children: nestedNodes } as Element);

      return {
        children: nested,
        node,
        sources: [schemaModelLocation(root, childPath)],
      };
    });
    const first = entries[0]?.node;
    const inlineContent =
      parent !== null &&
      (context.isInline(parent) ||
        isText(first) ||
        (isElement(first) && context.isInline(first)));

    if (inlineContent) {
      const collectInlineEntries = (
        entry: RepresentationEntry
      ): readonly RepresentationEntry[] => {
        if (
          isText(entry.node) ||
          (isElement(entry.node) && context.isInline(entry.node))
        ) {
          return [entry];
        }

        return (entry.children ?? []).flatMap(collectInlineEntries);
      };
      const flattened: RepresentationEntry[] = [];

      for (const entry of entries) {
        if (
          isText(entry.node) ||
          (isElement(entry.node) && context.isInline(entry.node))
        ) {
          flattened.push(entry);
          continue;
        }

        const content = collectInlineEntries(entry);

        if (content.length > 0) {
          repairs.push(
            schemaRepair({
              code: 'flatten-block-content',
              impact: 'lossy',
              inputs: entry.sources,
              outputs: [schemaModelLocation(root, path)],
              owner: 'representation',
            })
          );
          flattened.push(...content);
        }
      }

      const retained = flattened.filter((entry, index) => {
        if (!isText(entry.node) || entry.node.text !== '') return true;
        if (flattened.length === 1) return true;
        const previous = flattened[index - 1]?.node;
        const next = flattened[index + 1]?.node;
        const keep =
          (isElement(previous) && context.isInline(previous)) ||
          (isElement(next) && context.isInline(next));

        if (!keep) {
          repairs.push(
            schemaRepair({
              code: 'remove-empty-text',
              impact: 'lossless',
              inputs: entry.sources,
              owner: 'representation',
            })
          );
        }

        return keep;
      });
      const canonical: RepresentationEntry[] = [];

      for (const entry of retained) {
        if (isElement(entry.node) && context.isInline(entry.node)) {
          if (!isText(canonical.at(-1)?.node)) {
            repairs.push(
              schemaRepair({
                code: 'insert-inline-spacer',
                impact: 'lossless',
                outputs: [
                  schemaModelLocation(root, [...path, canonical.length]),
                ],
                owner: 'representation',
              })
            );
            canonical.push({ node: { text: '' }, sources: [] });
          }
          canonical.push(entry);
          continue;
        }
        const previous = canonical.at(-1);

        if (
          isText(entry.node) &&
          previous &&
          isText(previous.node) &&
          textPropertiesEqual(previous.node, entry.node, context)
        ) {
          const outputIndex = canonical.length - 1;

          repairs.push(
            schemaRepair({
              code: 'merge-text',
              impact: 'lossless',
              inputs: [...previous.sources, ...entry.sources],
              outputs: [schemaModelLocation(root, [...path, outputIndex])],
              owner: 'representation',
            })
          );
          canonical[outputIndex] = {
            node: {
              ...previous.node,
              text: previous.node.text + entry.node.text,
            },
            sources: [...previous.sources, ...entry.sources],
          };
          continue;
        }
        canonical.push(entry);
      }

      const last = canonical.at(-1)?.node;

      if (isElement(last) && context.isInline(last)) {
        repairs.push(
          schemaRepair({
            code: 'insert-inline-spacer',
            impact: 'lossless',
            outputs: [schemaModelLocation(root, [...path, canonical.length])],
            owner: 'representation',
          })
        );
        canonical.push({ node: { text: '' }, sources: [] });
      }
      if (canonical.length === 0) {
        repairs.push(
          schemaRepair({
            code: 'insert-empty-text',
            impact: 'lossless',
            outputs: [schemaModelLocation(root, [...path, 0])],
            owner: 'representation',
          })
        );
        canonical.push({ node: { text: '' }, sources: [] });
      }

      return canonical;
    }

    if (
      parent
        ? context.getElementContent(context.getElementType(parent) ?? '')
        : context.getRootContent(root)
    ) {
      return entries;
    }

    const blocks = entries.filter(
      (entry) => isElement(entry.node) && !context.isInline(entry.node)
    );
    const noncanonical = entries.filter((entry) => !blocks.includes(entry));

    for (const entry of noncanonical) {
      repairs.push(
        schemaRepair({
          code: 'remove-noncanonical-child',
          impact: 'lossy',
          inputs: entry.sources,
          owner: 'representation',
        })
      );
    }
    if (parent && blocks.length === 0) {
      repairs.push(
        schemaRepair({
          code: 'insert-empty-text',
          impact: 'lossless',
          outputs: [schemaModelLocation(root, [...path, 0])],
          owner: 'representation',
        })
      );

      return [{ node: { text: '' }, sources: [] }];
    }

    return blocks;
  };
  const classified = classifyChildren(input, null, []).map(({ node }) => node);

  if (repairs.length === 0 || !context.structurallyEqual(classified, output)) {
    throw new Error(
      `Unclassified canonical representation mutation in editor root "${root}".`
    );
  }

  return Object.freeze(repairs);
};
