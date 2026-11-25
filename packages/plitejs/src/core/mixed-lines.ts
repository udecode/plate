import type { AnyEditor as Editor, RootKey } from '../interfaces/editor';
import { isStart } from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import { type Descendant, NodeApi } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import { type Point, PointApi } from '../interfaces/point';
import { childAtPathIndex, type NodeList } from './change/document-index';
import { contentKindOf } from './content-completion';
import { getEditorRuntimeOwner, getEditorSchema } from './editor-runtime';
import {
  canonicalizePropertyValue,
  getCompiledEditorSchemaFromApi,
} from './editor-schema';
import { refuseVetoedWrite } from './node-write-veto';
import { definePluginPoint } from './plugin-point';
import { getPluginContributions } from './plugin-registry';
import {
  applyBuiltDocumentChange,
  getChildList,
  isPluginReconfigurationStagedInUpdate,
  syncImplicitTargetToCurrentSelection,
} from './public-state';
import {
  type CompiledEditorSchema,
  type CompiledSchemaContentProgram,
  type CompiledSchemaTargetContext,
  getCompiledPropertyCandidates,
  matchesCompiledSchemaTarget,
  resolveCompiledSchemaProperty,
} from './schema-compiler';
import { EditorSchemaValidationError } from './schema-validation';

export const textLineRefusal = definePluginPoint<true>('text-line.refusal');

export type TextLine = Readonly<{
  chain: readonly Element[];
  from: number;
  path: Path;
  root: RootKey;
  to: number;
}>;

export type LineBlock = Readonly<{
  properties?: Readonly<Record<string, unknown>>;
  type: string;
}>;

type Placement = 'element' | 'text';

const remainderOf = (content: CompiledSchemaContentProgram | null) =>
  content?.prefix ? (content.remainder ?? null) : content;

export const textLineAt = (
  editor: Editor,
  root: RootKey,
  point: Point
): TextLine | null => {
  if (
    getPluginContributions(getEditorRuntimeOwner(editor), textLineRefusal)
      .length > 0 ||
    isPluginReconfigurationStagedInUpdate(editor)
  ) {
    return null;
  }

  const schema = getEditorSchema(editor);
  const ancestors: Element[] = [];
  let siblings: NodeList<Descendant> = getChildList(editor);

  for (const index of point.path.slice(0, -1)) {
    const node = childAtPathIndex(siblings, index) as Element | undefined;

    if (!node?.children) return null;
    ancestors.unshift(node);
    siblings = node.children;
  }

  const depth = ancestors.findIndex((element) => !schema.isInline(element));
  const container = ancestors[depth];
  const content = container ? schema.getElementContent(container.type) : null;
  const program = remainderOf(content);

  if (!container || !program || contentKindOf(program, schema) !== 'mixed') {
    return null;
  }

  if (
    ancestors.some(
      (element) => schema.isIsolating(element) || schema.isReadOnly(element)
    )
  ) {
    return null;
  }

  const chain = ancestors.slice(depth);

  const path = point.path.slice(0, point.path.length - 1 - depth);
  const { children } = container;
  const isBlock = (index: number) => {
    const child = children[index];

    return NodeApi.isElement(child) && !schema.isInline(child);
  };
  let from = point.path[path.length] ?? 0;
  let to = from + 1;

  while (from > 0 && !isBlock(from - 1)) from -= 1;
  while (to < children.length && !isBlock(to)) to += 1;

  if (from === 0 && to === children.length) return null;

  return { chain, from, path, root, to };
};

const siteOf = (
  types: readonly string[],
  root: RootKey
): CompiledSchemaTargetContext => ({
  ancestors: types.slice(1),
  root: root === 'main' ? null : root,
  type: types[0] ?? '',
});

const declaredAt = (
  compiled: CompiledEditorSchema,
  placement: Placement,
  site: CompiledSchemaTargetContext
) =>
  [
    ...((placement === 'element'
      ? compiled.properties.elementAllowedByType
      : compiled.properties.textAllowedByParentType
    ).get(site.type) ?? []),
  ].flatMap((id) => {
    const property = compiled.properties.byId.get(id);

    return property &&
      typeof property.key === 'string' &&
      matchesCompiledSchemaTarget(compiled, property.target, site)
      ? [property]
      : [];
  });

const keepsDeclarations = (compiled: CompiledEditorSchema) => {
  const effective = new Map<string, readonly string[]>();
  const effectiveKeys = (
    placement: Placement,
    site: CompiledSchemaTargetContext
  ) => {
    const id = JSON.stringify([placement, site.type, site.ancestors]);
    let keys = effective.get(id);

    if (!keys) {
      keys = declaredAt(compiled, placement, site).flatMap(
        ({ descriptor, key }) =>
          descriptor.required ||
          descriptor.generate ||
          Object.hasOwn(descriptor, 'default')
            ? [key as string]
            : []
      );
      effective.set(id, keys);
    }

    return keys;
  };

  return (
    placement: Placement,
    node: Readonly<Record<string, unknown>>,
    from: CompiledSchemaTargetContext,
    to: CompiledSchemaTargetContext
  ) =>
    [
      ...Object.keys(node),
      ...effectiveKeys(placement, from),
      ...effectiveKeys(placement, to),
    ].every(
      (key) =>
        key === 'children' ||
        key === 'text' ||
        key === 'type' ||
        resolveCompiledSchemaProperty(compiled, placement, key, from) ===
          resolveCompiledSchemaProperty(compiled, placement, key, to)
    );
};

export const admitLineBlock = (
  editor: Editor,
  line: TextLine,
  {
    at,
    end,
    marks,
  }: Readonly<{
    at: Point;
    end: Point;
    marks: Readonly<Record<string, unknown>> | null;
  }>
): LineBlock | null => {
  const schema = getEditorSchema(editor);
  const compiled = getCompiledEditorSchemaFromApi(schema);
  const [container] = line.chain;
  const content = container && schema.getElementContent(container.type);
  const inLine = (point: Point) => {
    const index = point.path[line.path.length] ?? -1;

    return (
      point.path.length > line.path.length &&
      line.path.every((step, depth) => point.path[depth] === step) &&
      index >= line.from &&
      index < line.to
    );
  };

  if (!compiled || !container || !content || !inLine(end)) return null;

  const { root } = line;
  const outer = line.chain.map((element) => element.type);
  const below = at.path.slice(line.path.length);
  const inlines: Element[] = [];
  let caret: Descendant = container;

  for (const [depth, index] of below.entries()) {
    if (!NodeApi.isElement(caret)) return null;
    caret = caret.children[index];

    if (NodeApi.isElement(caret)) {
      const own = schema.getElementContent(caret.type);
      const cut = !isStart(editor, at, [
        ...line.path,
        ...below.slice(0, depth + 1),
      ]);

      if (cut && own && own.min > 1) return null;
      inlines.unshift(caret);
    }
  }

  if (!NodeApi.isText(caret)) return null;

  const past =
    PointApi.equals(at, end) && caret.text[at.offset] === '\n'
      ? { ...at, offset: at.offset + 1 }
      : end;
  const restIsEmpty = (inline: Element, index: number) => {
    const path = [...line.path, ...below.slice(0, below.length - 1 - index)];

    return [...NodeApi.texts(inline)].every(([text, inner]) => {
      const order = PathApi.compare([...path, ...inner], past.path);

      return (
        order < 0 ||
        (order === 0 ? text.text.slice(past.offset) : text.text) === ''
      );
    });
  };
  const kept = inlines.findIndex(
    (inline, index) => !restIsEmpty(inline, index)
  );
  const exits = kept === -1 ? inlines.length : kept;
  const caretTypes = inlines.map((inline) => inline.type);
  const keeps = keepsDeclarations(compiled);
  const lineNodes = container.children.slice(line.from, line.to);
  const caretSite = siteOf([...caretTypes, ...outer], root);
  const collapsed = PointApi.equals(at, end);
  const nextLetterMarks: Array<readonly [string, CompiledSchemaTargetContext]> =
    collapsed
      ? Object.keys(marks ?? {}).map((key) => [key, caretSite] as const)
      : [];
  const readLetters = (
    node: Descendant,
    path: Path,
    types: readonly string[]
  ): void => {
    if (!NodeApi.isText(node)) {
      node.children.forEach((child, index) => {
        readLetters(child, [...path, index], [node.type, ...types]);
      });
    } else if (
      PathApi.compare(path, at.path) >= 0 &&
      PathApi.compare(path, end.path) <= 0
    ) {
      for (const key of Object.keys(node)) {
        if (key !== 'text') nextLetterMarks.push([key, siteOf(types, root)]);
      }
    }
  };

  if (!collapsed) {
    const last = end.path[line.path.length] ?? -1;

    for (let index = below[0] ?? line.to; index <= last; index += 1) {
      readLetters(container.children[index], [...line.path, index], outer);
    }
  }
  const removing = lineNodes.map((_, offset) => line.from + offset);
  const keepsDescendants = (
    nodes: readonly Descendant[],
    before: readonly string[],
    after: readonly string[]
  ): boolean =>
    nodes.every((node) => {
      if (NodeApi.isText(node)) {
        return keeps('text', node, siteOf(before, root), siteOf(after, root));
      }

      const own = [node.type, ...before];
      const moved = [node.type, ...after];

      return (
        keeps('element', node, siteOf(own, root), siteOf(moved, root)) &&
        keepsDescendants(node.children, own, moved)
      );
    });
  const needsNothing = ({ properties = {}, type }: LineBlock) => {
    const site = siteOf([type, ...outer], root);

    return (
      declaredAt(compiled, 'element', site).every(
        ({ descriptor, key, lifecycle }) =>
          descriptor.generate
            ? lifecycle.split === 'drop'
            : !descriptor.required ||
              (Object.hasOwn(properties, key as string) &&
                lifecycle.split === 'preserve')
      ) &&
      declaredAt(compiled, 'text', site).every(
        ({ descriptor }) => !descriptor.required
      )
    );
  };
  const ownPropertiesHold = ({ properties = {}, type }: LineBlock) => {
    const site = siteOf([type, ...outer], root);

    return Object.entries(properties).every(([key, value]) => {
      const property = resolveCompiledSchemaProperty(
        compiled,
        'element',
        key,
        site
      );

      if (!property) {
        return (
          compiled.unknown === 'preserve' &&
          getCompiledPropertyCandidates(compiled, 'element', key).length === 0
        );
      }

      try {
        canonicalizePropertyValue(key, property.descriptor, value);

        return true;
      } catch (error) {
        if (error instanceof EditorSchemaValidationError) return false;
        throw error;
      }
    });
  };
  const marksHoldAtEveryExit = (
    block: LineBlock,
    compareWith: (
      around: readonly string[],
      from: CompiledSchemaTargetContext
    ) => CompiledSchemaTargetContext
  ) =>
    Array.from({ length: exits + 1 }, (_, exited) =>
      caretTypes.slice(exited)
    ).every((around) =>
      nextLetterMarks.every(
        ([key, from]) =>
          resolveCompiledSchemaProperty(
            compiled,
            'text',
            key,
            siteOf([...around, block.type, ...outer], root)
          ) ===
          resolveCompiledSchemaProperty(
            compiled,
            'text',
            key,
            compareWith(around, from)
          )
      )
    );
  const keepsMarks = (block: LineBlock) =>
    marksHoldAtEveryExit(block, (_, from) => from);
  const readsMarksAsToday = (block: LineBlock) =>
    marksHoldAtEveryExit(block, (around) =>
      siteOf([...around, ...outer], root)
    );
  const takes = (block: LineBlock) => {
    const element = compiled.elements.byType.get(block.type);
    const own = element?.content;
    const behavior = element?.behavior;
    const shell = {
      ...block.properties,
      children: [],
      type: block.type,
    } as Element;

    return (
      !!behavior &&
      !!own &&
      behavior.selectable &&
      !behavior.atom &&
      !behavior.readOnly &&
      !behavior.inline &&
      !behavior.isolating &&
      !own.prefix &&
      own.max === null &&
      own.min <= 1 &&
      element.contentRoots.size === 0 &&
      lineNodes.every((child) => schema.canContain(shell, child)) &&
      container.children.length - removing.length + 2 >= content.min &&
      schema.canPlaceAt(
        container,
        container.children,
        [shell, shell],
        line.from,
        {
          removing,
          root,
        }
      ) &&
      needsNothing(block) &&
      ownPropertiesHold(block) &&
      keepsDescendants(lineNodes, outer, [block.type, ...outer])
    );
  };

  const tried = new Set<string>();
  const fits: LineBlock[] = [];

  for (const plan of [
    remainderOf(content)?.defaultPlan,
    remainderOf(schema.getRootContent(root))?.defaultPlan,
  ]) {
    if (plan?.kind !== 'element') continue;

    const block = { properties: plan.properties, type: plan.type };
    const id = JSON.stringify(block);

    if (tried.has(id)) continue;
    tried.add(id);
    if (takes(block)) fits.push(block);
  }

  return fits.find(keepsMarks) ?? fits.find(readsMarksAsToday) ?? null;
};

export const wrapTextLine = (
  editor: Editor,
  line: TextLine,
  block: LineBlock
) => {
  const [container] = line.chain;

  for (let index = line.from; index < line.to; index += 1) {
    const node = container?.children[index];

    if (NodeApi.isElement(node)) {
      refuseVetoedWrite(editor, {
        kind: 'wrap',
        node,
        path: [...line.path, index],
        root: line.root,
      });
    }
  }

  const { children: _children, ...shell } = getEditorSchema(editor).createAt(
    block.type,
    block.properties,
    { ancestors: line.chain, children: [], root: line.root }
  );

  syncImplicitTargetToCurrentSelection(editor);
  applyBuiltDocumentChange(editor, (builder, root) =>
    builder.wrapChildren(root, line.path, line.from, line.to - line.from, shell)
  );
};
