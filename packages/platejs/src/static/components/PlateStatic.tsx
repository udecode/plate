import { clsx } from 'clsx';
import React from 'react';

import {
  type Descendant,
  type EditorDocumentValue,
  type Element,
  type NodeEntry,
  type Path,
  type Text,
  ElementApi,
  NodeApi,
  RangeApi,
  TextApi,
  MAIN_ROOT_KEY,
  getEditorRuntimeOwner,
  getReaderRange,
  withDocumentViewRead,
} from '../../facade';
import { mergePlateRenderedAttributes } from '../../internal/mergePlateRenderedAttributes';
import {
  getCompiledPlatePluginByType,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { getPlateDecorationSources } from '../../internal/plugin/getPlateDecorationSources';
import type { Editor, RenderElementSlots } from '../../lib';
import type {
  Decoration,
  DecorationAttributes,
  DecorationSource,
} from '../internal/plite-react';
import {
  getStaticDocumentView,
  getStaticRootView,
} from '../internal/staticDocumentView';
import { pipeRenderElementStatic } from '../pipeRenderElementStatic.internal';
import { pipeRenderLeafStatic } from '../pluginRenderLeafStatic.internal';
import { pipeRenderTextStatic } from '../pluginRenderTextStatic.internal';
import type { RenderElementProps } from '../types';

const EMPTY_DECORATIONS: readonly Decoration[] = [];
const EMPTY_PATH: Path = [];
const EMPTY_ROOT_STACK: readonly string[] = [];

type StaticDecorationSlice = Readonly<{
  attributes: DecorationAttributes;
  end: number;
  key: string;
  start: number;
}>;

const areStaticDecorationsEqual = (
  left: readonly Decoration[],
  right: readonly Decoration[]
) =>
  left === right ||
  (left.length === right.length &&
    left.every((decoration, index) => {
      const other = right[index];

      return (
        decoration.key === other?.key &&
        RangeApi.equals(decoration.range, other.range) &&
        (decoration.attributes === other.attributes ||
          JSON.stringify(decoration.attributes) ===
            JSON.stringify(other.attributes))
      );
    }));

const readSchema = (editor: Editor) => editor.read((state) => state.schema);

type ContentRootInput = Readonly<{
  nodes: readonly Descendant[];
  root: string;
}>;

type BlockInputs = Readonly<{
  contentRoots: readonly ContentRootInput[];
  decorations: readonly Decoration[];
  readsDocument: boolean;
}>;

const EMPTY_BLOCK_INPUTS: BlockInputs = Object.freeze({
  contentRoots: Object.freeze([]),
  decorations: EMPTY_DECORATIONS,
  readsDocument: false,
});

const blockInputEqualities = new WeakMap<
  BlockInputs,
  WeakMap<BlockInputs, boolean>
>();

const areBlockInputsEqual = (left: BlockInputs, right: BlockInputs) => {
  if (left === right) return true;

  let equalities = blockInputEqualities.get(left);

  if (!equalities) {
    equalities = new WeakMap();
    blockInputEqualities.set(left, equalities);
  }

  let equal = equalities.get(right);

  if (equal === undefined) {
    equal =
      left.readsDocument === right.readsDocument &&
      left.contentRoots.length === right.contentRoots.length &&
      left.contentRoots.every(
        ({ nodes, root }, index) =>
          nodes === right.contentRoots[index]?.nodes &&
          root === right.contentRoots[index]?.root
      ) &&
      areStaticDecorationsEqual(left.decorations, right.decorations);
    equalities.set(right, equal);
  }

  return equal;
};

/**
 * Read a source's decorations for an entry of `reader`, whose root is `root`.
 * Output is relative to its reader: a range naming another root, or two
 * roots, cannot paint here.
 */
const readDecorations = (
  source: DecorationSource,
  reader: Editor,
  root: string,
  entry: NodeEntry
): readonly Decoration[] => {
  const output = source.read({ editor: reader, entry });
  let admitted: Decoration[] | undefined;

  output.forEach((decoration, index) => {
    const range = getReaderRange(decoration.range, root);

    if (range === decoration.range) {
      admitted?.push(decoration);
      return;
    }

    admitted ??= output.slice(0, index);
    if (range) admitted.push({ ...decoration, range });
  });

  return admitted ?? output;
};

/**
 * Read what a block renders beyond its own nodes: every source's decorations
 * over its subtree, the content roots owned anywhere inside it with their
 * decorations, and whether an element in them reads the document. A reused
 * block skips all of it, so all of it is the block's memo input.
 */
const readBlockInputs = (
  sources: readonly DecorationSource[],
  editor: Editor,
  root: string,
  schema: ReturnType<typeof readSchema>,
  block: Element,
  path: Path,
  own: readonly Decoration[]
): BlockInputs => {
  const decorations: Decoration[] = [...own];
  const contentRoots: ContentRootInput[] = [];
  let readsDocument = readsDocumentWithin(editor, block);
  const visitContentRoots = (reader: Editor, element: Element) => {
    for (const contentRoot of Object.values(
      schema.getElementContentRoots(element)
    )) {
      const rootReader = getStaticRootView(reader, contentRoot);
      const nodes = rootReader.read.children();

      contentRoots.push({ nodes, root: contentRoot });
      nodes.forEach((node, index) => {
        if (
          ElementApi.isElement(node) &&
          readsDocumentWithin(rootReader, node)
        ) {
          readsDocument = true;
        }
        visit(rootReader, contentRoot, node, [index]);
      });
    }
  };
  const visit = (
    reader: Editor,
    readerRoot: string,
    node: Descendant,
    nodePath: Path
  ) => {
    for (const source of sources) {
      decorations.push(
        ...readDecorations(source, reader, readerRoot, [node, nodePath])
      );
    }
    if (ElementApi.isElement(node)) {
      visitContentRoots(reader, node);
      node.children.forEach((child, index) =>
        visit(reader, readerRoot, child, [...nodePath, index])
      );
    }
  };

  visitContentRoots(editor, block);
  block.children.forEach((child, index) =>
    visit(editor, root, child, [...path, index])
  );

  if (contentRoots.length === 0 && decorations.length === 0 && !readsDocument) {
    return EMPTY_BLOCK_INPUTS;
  }

  return {
    contentRoots,
    decorations: decorations.length === 0 ? EMPTY_DECORATIONS : decorations,
    readsDocument,
  };
};

// A range paints only its part on this leaf: another leaf's range, or the
// rest of a range spanning several leaves, paints nothing here.
const getStaticDecorationSlices = (
  text: Text,
  path: Path,
  decorations: readonly Decoration[]
): readonly StaticDecorationSlice[] => {
  const leaf = {
    anchor: { offset: 0, path },
    focus: { offset: text.text.length, path },
  };

  return decorations.flatMap(({ attributes, key, range }) => {
    const slice = RangeApi.intersection(range, leaf);

    if (!slice) return [];

    const [start, end] = RangeApi.edges(slice);

    return [{ attributes, end: end.offset, key, start: start.offset }];
  });
};

const splitStaticText = (
  text: Text,
  path: Path,
  decorations: readonly Decoration[]
) => {
  const slices = getStaticDecorationSlices(text, path, decorations);

  if (text.text.length === 0) {
    return [{ decorations: [], end: 0, start: 0, text: '' }];
  }

  const boundaries = new Set<number>([0, text.text.length]);

  slices.forEach(({ end, start }) => {
    boundaries.add(start);
    boundaries.add(end);
  });
  const sorted = [...boundaries].sort((left, right) => left - right);

  return sorted.slice(0, -1).flatMap((start, index) => {
    const end = sorted[index + 1];

    if (start === end) return [];

    return [
      {
        decorations: slices.filter(
          (decoration) => decoration.start < end && decoration.end > start
        ),
        end,
        start,
        text: text.text.slice(start, end),
      },
    ];
  });
};

function BaseElementStatic({
  block,
  sources,
  decorations,
  documentNodes,
  editor,
  element,
  path,
  rootNodes,
  rootStack,
}: {
  block: BlockInputs;
  sources: readonly DecorationSource[];
  decorations: readonly Decoration[];
  documentNodes: readonly Descendant[];
  editor: Editor;
  element: Element;
  path: Path;
  rootNodes: readonly Descendant[];
  rootStack: readonly string[];
  style?: React.CSSProperties;
}) {
  const renderElement = pipeRenderElementStatic(editor);
  const schema = readSchema(editor);

  const attributes: RenderElementProps['attributes'] = {
    'data-editor-node': 'element',
    'data-editor-path': path.join(','),
    'data-editor-root': rootStack.at(-1) ?? MAIN_ROOT_KEY,
  };

  const renderChildren = (range: { from?: number; to?: number } = {}) => (
    <Children
      block={block}
      sources={sources}
      decorations={decorations}
      documentNodes={documentNodes}
      editor={editor}
      from={range.from}
      nodes={element.children}
      parentPath={path}
      rootNodes={rootNodes}
      rootStack={rootStack}
      to={range.to ?? range.from}
    />
  );
  let children: React.ReactNode = renderChildren();

  const slots = {
    children: renderChildren,
    contentBoundary: ({ children: boundaryChildren, scope }) =>
      boundaryChildren ??
      (scope.type === 'self'
        ? renderChildren()
        : renderChildren({ from: scope.from, to: scope.to })),
    contentRoot: (slot) => {
      const root = schema.getElementContentRoots(element)[slot];

      if (!root) {
        throw new Error(
          `Element "${element.type}" does not own content root slot "${slot}".`
        );
      }
      if (rootStack.includes(root)) {
        throw new Error(
          `Content root "${root}" cannot recursively render itself.`
        );
      }

      const rootEditor = getStaticRootView(editor, root);
      const nodes = rootEditor.read.children();

      return (
        <Children
          sources={sources}
          decorations={[]}
          documentNodes={documentNodes}
          editor={rootEditor}
          nodes={nodes}
          rootNodes={nodes}
          rootStack={[...rootStack, root]}
        />
      );
    },
  } satisfies RenderElementSlots;

  if (schema.isVoid(element)) {
    attributes['data-editor-void'] = true;
    children = (
      <span
        style={{
          color: 'transparent',
          height: '0',
          position: 'absolute',
        }}
        data-editor-spacer
      >
        {renderChildren()}
      </span>
    );
  }
  if (schema.isInline(element)) {
    attributes['data-editor-inline'] = true;
  }

  return (
    <>
      {withDocumentViewRead(editor, () =>
        renderElement?.({ attributes, children, element, path, slots })
      )}
    </>
  );
}

const unchangedBlockCounts = new WeakMap<
  readonly Descendant[],
  WeakMap<readonly Descendant[], number>
>();

/** Count the leading blocks two renders share by identity. */
const countUnchangedBlocks = (
  previous: readonly Descendant[],
  next: readonly Descendant[]
) => {
  let counts = unchangedBlockCounts.get(previous);

  if (!counts) {
    counts = new WeakMap();
    unchangedBlockCounts.set(previous, counts);
  }

  let count = counts.get(next);

  if (count === undefined) {
    count = 0;
    while (
      count < previous.length &&
      count < next.length &&
      previous[count] === next[count]
    ) {
      count += 1;
    }
    counts.set(next, count);
  }

  return count;
};

// Another document of the same editor reuses a block while it and every block
// before it are unchanged: renderers may read earlier blocks (list numbers) or
// their own block (table borders). Elements that read later content declare
// `render.readsDocument` and render again on any change.
const documentReaders = new WeakMap<object, WeakMap<Element, boolean>>();

// A reused element skips its whole subtree, so it reads the document when it
// or any element inside it declares `render.readsDocument`, such as a table
// of contents inside a table cell. Cached per block and published plugins.
const readsDocumentWithin = (editor: Editor, element: Element): boolean => {
  const runtime = getPlateRuntime(editor);
  let readers = documentReaders.get(runtime);

  if (!readers) {
    readers = new WeakMap();
    documentReaders.set(runtime, readers);
  }

  let reads = readers.get(element);

  if (reads === undefined) {
    reads =
      getCompiledPlatePluginByType(editor, element.type)?.render
        .readsDocument === true ||
      element.children.some(
        (child) =>
          ElementApi.isElement(child) && readsDocumentWithin(editor, child)
      );
    readers.set(element, reads);
  }

  return reads;
};

const isSameRenderedDocument = (
  prev: Parameters<typeof BaseElementStatic>[0],
  next: Parameters<typeof BaseElementStatic>[0]
) =>
  // A content root can stay unchanged while the rest of the document changed,
  // so only an unchanged document and root keep a document reader.
  prev.documentNodes === next.documentNodes && prev.rootNodes === next.rootNodes
    ? prev.editor === next.editor
    : getEditorRuntimeOwner(prev.editor) ===
        getEditorRuntimeOwner(next.editor) &&
      !next.block.readsDocument &&
      countUnchangedBlocks(prev.rootNodes, next.rootNodes) > next.path[0];

const ElementStatic = React.memo(
  BaseElementStatic,
  (prev, next) =>
    prev.path.join(',') === next.path.join(',') &&
    prev.rootStack.at(-1) === next.rootStack.at(-1) &&
    prev.element === next.element &&
    isSameRenderedDocument(prev, next) &&
    areBlockInputsEqual(prev.block, next.block) &&
    areStaticDecorationsEqual(prev.decorations, next.decorations)
);

function BaseLeafStatic({
  decorations,
  editor,
  path,
  rootStack,
  text,
}: {
  decorations: readonly Decoration[];
  editor: Editor;
  path: Path;
  rootStack: readonly string[];
  text: Text;
}) {
  const renderLeaf = pipeRenderLeafStatic(editor);
  const renderText = pipeRenderTextStatic(editor);

  const segments = splitStaticText(text, path, decorations);
  const leafElements = segments.map((segment, index) => {
    const leaf = { ...text, text: segment.text };
    const position =
      segments.length > 1
        ? {
            end: segment.end,
            isFirst: index === 0 ? (true as const) : undefined,
            isLast: index === segments.length - 1 ? (true as const) : undefined,
            start: segment.start,
          }
        : undefined;
    const content = segment.decorations.reduceRight(
      (children, decoration) => (
        <span key={decoration.key} {...decoration.attributes}>
          {children}
        </span>
      ),
      <span
        data-editor-end={segment.end}
        data-editor-start={segment.start}
        data-editor-string={true}
      >
        {segment.text === '' ? '\uFEFF' : segment.text}
      </span>
    );
    const leafElement = withDocumentViewRead(editor, () =>
      renderLeaf({
        attributes: { 'data-editor-leaf': true },
        children: content,
        leaf,
        leafPosition: position,
        path,
        text: leaf,
      })
    );

    return (
      <React.Fragment
        key={`${position?.start ?? 0}:${position?.end ?? leaf.text.length}:${segment.decorations.map(({ key }) => key).join(':')}`}
      >
        {leafElement}
      </React.Fragment>
    );
  });

  return withDocumentViewRead(editor, () =>
    renderText({
      attributes: {
        'data-editor-node': 'text' as const,
        'data-editor-path': path.join(','),
        'data-editor-root': rootStack.at(-1) ?? MAIN_ROOT_KEY,
        ref: null,
      },
      children: leafElements,
      path,
      text,
    })
  );
}

const LeafStatic = React.memo(
  BaseLeafStatic,
  (prev, next) =>
    prev.editor === next.editor &&
    prev.path.join(',') === next.path.join(',') &&
    prev.rootStack.at(-1) === next.rootStack.at(-1) &&
    TextApi.equals(next.text, prev.text) &&
    areStaticDecorationsEqual(next.decorations, prev.decorations)
);

function Children({
  block = EMPTY_BLOCK_INPUTS,
  sources,
  decorations,
  documentNodes,
  editor,
  from,
  nodes,
  parentPath = EMPTY_PATH,
  rootNodes = nodes,
  rootStack = EMPTY_ROOT_STACK,
  to,
}: {
  block?: BlockInputs;
  sources: readonly DecorationSource[];
  decorations: readonly Decoration[];
  documentNodes: readonly Descendant[];
  editor: Editor;
  from?: number;
  nodes: readonly Descendant[];
  parentPath?: Path;
  rootNodes?: readonly Descendant[];
  rootStack?: readonly string[];
  to?: number;
}) {
  const root: Element = {
    children: rootNodes,
    type: 'static-root',
  };
  const readerRoot = rootStack.at(-1) ?? MAIN_ROOT_KEY;
  // Schema queries read the shared model, so one read serves every child.
  const schema = readSchema(editor);

  return (
    <>
      {nodes.map((child, i) => {
        if (from !== undefined && (i < from || i > (to ?? from))) return null;

        const p = [...parentPath, i];
        const entry: NodeEntry = [child, p];
        const read =
          sources.length === 0
            ? EMPTY_DECORATIONS
            : sources.flatMap((source) =>
                readDecorations(source, editor, readerRoot, entry)
              );
        const own = read.length === 0 ? EMPTY_DECORATIONS : read;
        let ds = own;

        if (decorations.length > 0) {
          const [first, firstPath] = NodeApi.first(root, p);
          const [last, lastPath] = NodeApi.last(root, p);

          if (TextApi.isText(first) && TextApi.isText(last)) {
            const range = {
              anchor: { offset: 0, path: firstPath },
              focus: { offset: last.text.length, path: lastPath },
            };
            const inherited = decorations.flatMap((decoration) => {
              const intersection = RangeApi.intersection(
                decoration.range,
                range
              );

              return intersection
                ? [{ ...decoration, range: intersection }]
                : [];
            });

            if (inherited.length > 0) ds = [...own, ...inherited];
          }
        }

        return ElementApi.isElement(child) ? (
          <ElementStatic
            key={p.join('.')}
            block={
              parentPath.length === 0
                ? readBlockInputs(
                    sources,
                    editor,
                    readerRoot,
                    schema,
                    child,
                    p,
                    own
                  )
                : block
            }
            sources={sources}
            decorations={ds}
            documentNodes={documentNodes}
            editor={editor}
            element={child}
            path={p}
            rootNodes={rootNodes}
            rootStack={rootStack}
          />
        ) : (
          <LeafStatic
            key={p.join('.')}
            decorations={ds}
            editor={editor}
            path={p}
            rootStack={rootStack}
            text={child}
          />
        );
      })}
    </>
  );
}

export type EditorStaticProps<E = Editor> = {
  /**
   * A document to render instead of the editor's own, such as a streamed
   * preview. The editor supplies the plugins and is not edited. Pass the same
   * object again to reuse its validated view. Reads, plugin reads and plugin
   * APIs on the rendered editor see the document; an editor captured when a
   * plugin was created still holds its own value.
   */
  document?: EditorDocumentValue;
  /** Editor instance. */
  editor: E;
  style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLDivElement>;

export function EditorStatic<E = Editor>(props: EditorStaticProps<E>) {
  const { document, editor: editorInput, ...rest } = props;
  const editor = getStaticDocumentView(editorInput as Editor, document);
  const attributes = mergePlateRenderedAttributes(
    getPlateRuntime(editor).pluginCache.contentAttributes.readOnly,
    rest
  );

  const sources = getPlateDecorationSources(editor);
  const readerRoot = editor.read.view.root();

  const content = (
    <div
      {...attributes}
      className={clsx('editor-editor', attributes.className)}
      data-editor
      data-editor-node="value"
    >
      <Children
        sources={sources}
        decorations={[]}
        documentNodes={editor.read.children()}
        editor={editor}
        nodes={editor.read.children()}
        rootNodes={editor.read.children()}
        rootStack={readerRoot ? [readerRoot] : EMPTY_ROOT_STACK}
      />
    </div>
  );

  return content;
}
