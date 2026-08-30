import {
  type Ancestor,
  createEditor,
  defineEditorSchema,
  NodeApi,
  type NodeLiftNodesOptions,
  property,
  schema,
  type EditorParentOptions,
  type SchemaElementFor,
} from 'plitejs';

import { nodes as staticNodes } from '../src/editor/nodes';
import {
  above as staticAbove,
  insertNode,
  insertNodes,
  liftNodes,
  mergeNodes,
  moveNodes,
  parent as staticParent,
  removeNodes,
  setNodes,
  splitNodes,
  unsetNodes,
  unwrapNodes,
  wrapNodes,
} from '../src/internal';

const ArticleSchema = defineEditorSchema('schema:node-query-inference', {
  elements: {
    heading: {
      content: schema.content.text(),
      properties: { level: property.number() },
    },
    paragraph: {
      content: schema.content.text(),
      properties: { align: property.string() },
    },
  },
  root: schema.content.types(['heading', 'paragraph']),
  unknown: 'reject',
});

const assertNodeQueryInference = () => {
  const editor = createEditor({ extensions: [ArticleSchema] });
  const heading = schema.handle.element(ArticleSchema, 'heading');
  const paragraph = schema.handle.element(ArticleSchema, 'paragraph');
  const maybeHeading = null as unknown as typeof heading | undefined;

  const headingEntry = editor.read.nodes.find({
    match: (node, path) => {
      node.level satisfies number | undefined;
      path satisfies readonly number[];

      return node.level === 2;
    },
    type: heading,
  });

  headingEntry?.[0].level satisfies number | undefined;
  // @ts-expect-error heading selection does not expose paragraph properties
  headingEntry?.[0].align;

  const stringEntry = editor.read.nodes.find({ type: 'paragraph' });
  stringEntry?.[0].type satisfies 'paragraph' | undefined;

  const unionEntries = editor.read.nodes.toArray({
    type: [heading, paragraph] as const,
  });
  unionEntries[0]?.[0].type satisfies 'heading' | 'paragraph';

  const staticParagraphEntries = staticNodes(editor, { type: paragraph });
  staticParagraphEntries.next().value?.[0].align satisfies string | undefined;
  // @ts-expect-error raw node output types cannot be selected by a caller generic
  staticNodes<SchemaElementFor<typeof ArticleSchema, 'paragraph'>>(editor);

  editor.read.nodes.find({
    type: [heading, paragraph] as const,
    // @ts-expect-error a matcher must accept every structurally selected node
    match: (node: SchemaElementFor<typeof ArticleSchema, 'heading'>) =>
      node.level === 2,
  });

  const guardedEntry = editor.read.nodes.find({
    match: (
      node
    ): node is SchemaElementFor<typeof ArticleSchema, 'paragraph'> =>
      'type' in node && node.type === 'paragraph',
  });
  guardedEntry?.[0].align satisfies string | undefined;
  const guardedAligns = editor.read.nodes
    .toArray({
      match: (
        node
      ): node is SchemaElementFor<typeof ArticleSchema, 'paragraph'> =>
        'type' in node && node.type === 'paragraph',
    })
    .map(([node]) => node.align);
  guardedAligns[0] satisfies string | undefined;

  editor.read.nodes.next({ type: maybeHeading });

  const exactHeading = editor.read.nodes.get([0], { type: heading });
  exactHeading?.[0].level satisfies number | undefined;
  // @ts-expect-error heading selection does not expose paragraph properties
  exactHeading?.[0].align;

  const rootAwareEntry = editor.read.nodes.get([]);
  if (rootAwareEntry && NodeApi.isElement(rootAwareEntry[0])) {
    rootAwareEntry[0].type satisfies string;
  }
  // @ts-expect-error selectorless lookup cannot promise one descendant shape
  rootAwareEntry?.[0].level;

  const headingParent = editor.read.nodes.parent([0, 0], { type: heading });
  headingParent?.[0].level satisfies number | undefined;

  const rootAwareAbove = editor.read.nodes.above({
    at: [0, 0],
    match: (node, path): node is typeof editor => {
      node satisfies Ancestor;
      path satisfies readonly number[];

      return NodeApi.isEditor(node);
    },
    mode: 'highest',
  });
  rootAwareAbove?.[0].api;

  const staticRootAwareAbove = staticAbove(editor, {
    at: [0, 0],
    match: (node): node is typeof editor => {
      node satisfies Ancestor;

      return NodeApi.isEditor(node);
    },
    mode: 'highest',
  });
  staticRootAwareAbove?.[0].api;

  const requiredStaticParent = staticParent(editor, [0, 0]);
  requiredStaticParent[0];
  const widenedParentOptions: EditorParentOptions = { type: 'heading' };
  const maybeStaticParent = staticParent(editor, [0, 0], widenedParentOptions);
  maybeStaticParent?.[0];
  // @ts-expect-error widened options may filter out the direct parent
  const [incorrectlyRequiredParent] = staticParent(
    editor,
    [0, 0],
    widenedParentOptions
  );

  // @ts-expect-error object matcher DSL is not supported
  editor.read.nodes.find({ match: { type: 'paragraph' } });
  // @ts-expect-error node output types cannot be selected by a caller generic
  editor.read.nodes.find<SchemaElementFor<typeof ArticleSchema, 'paragraph'>>();
  // @ts-expect-error transaction capabilities come only from installed extensions
  editor.update<{ forged: () => void }>((tx) => tx.forged());
  editor.update(
    // @ts-expect-error an annotated callback cannot forge transaction capabilities
    (tx: { forged: () => void }) => tx.forged()
  );
  // @ts-expect-error node mutation targets cannot be selected by a caller generic
  editor.update.nodes.set<SchemaElementFor<typeof ArticleSchema, 'paragraph'>>({
    align: 'center',
  });

  editor.update((tx) => {
    tx.blocks.duplicate({ type: maybeHeading });
    tx.nodes.remove({
      match: (node) => node.align === 'center',
      type: paragraph,
    });
    tx.nodes.set({ level: 2 }, { type: heading });
    tx.nodes.unset('align', {
      match: (node) => node.align !== undefined,
      type: paragraph,
    });
    // @ts-expect-error unset targets cannot be selected by a caller generic
    tx.nodes.unset<SchemaElementFor<typeof ArticleSchema, 'paragraph'>>(
      'align'
    );
    tx.nodes.insert(
      { children: [{ text: '' }], level: 1, type: 'heading' },
      {
        split: {
          match: (node) => node.align !== undefined,
          type: paragraph,
        },
      }
    );
    tx.nodes.insert(
      { children: [{ text: '' }], level: 1, type: 'heading' },
      {
        split: {
          // @ts-expect-error a split predicate cannot choose its own unchecked node type
          match: (node: SchemaElementFor<typeof ArticleSchema, 'paragraph'>) =>
            node.align !== undefined,
        },
      }
    );
    tx.nodes.insert(
      { children: [{ text: '' }], level: 1, type: 'heading' },
      {
        split: {
          match: () => true,
          type: maybeHeading,
        },
      }
    );
  });

  editor.update.nodes.remove({
    match: (node) => {
      // @ts-expect-error a maybe-undefined selector cannot narrow the predicate
      node.level;

      return true;
    },
    type: maybeHeading,
  });

  const assertStaticTransformInference = () => {
    const optionalLiftOptions: NodeLiftNodesOptions = {
      type: maybeHeading,
    };

    liftNodes(editor, optionalLiftOptions);
    mergeNodes(editor, { type: maybeHeading });
    moveNodes(editor, { to: [0], type: maybeHeading });
    removeNodes(editor, { type: maybeHeading });
    setNodes(editor, {}, { type: maybeHeading });
    splitNodes(editor, { type: maybeHeading });
    unsetNodes(editor, 'align', { type: maybeHeading });
    unwrapNodes(editor, { type: maybeHeading });
    wrapNodes(
      editor,
      { children: [{ text: '' }], type: 'paragraph' },
      { type: maybeHeading }
    );
    setNodes(editor, { level: 3 }, { type: heading });
    // @ts-expect-error a heading selector does not accept paragraph properties
    setNodes(editor, { align: 'center' }, { type: heading });
    removeNodes(editor, {
      match: (node) => node.align !== undefined,
      type: paragraph,
    });
    setNodes(
      editor,
      { align: 'center' },
      {
        // @ts-expect-error a direct mutation predicate cannot select its own target type
        match: (node: SchemaElementFor<typeof ArticleSchema, 'paragraph'>) =>
          node.align !== undefined,
      }
    );
    liftNodes(editor, { type: paragraph });
    mergeNodes(editor, { type: paragraph });
    moveNodes(editor, { to: [0], type: paragraph });
    splitNodes(editor, { type: paragraph });
    unwrapNodes(editor, { type: paragraph });
    wrapNodes(
      editor,
      { children: [{ text: '' }], type: 'paragraph' },
      { type: heading }
    );
    insertNode(
      editor,
      { children: [{ text: '' }], level: 1, type: 'heading' },
      {
        split: {
          match: (node) => node.align !== undefined,
          type: paragraph,
        },
      }
    );
    insertNode(
      editor,
      { children: [{ text: '' }], level: 1, type: 'heading' },
      {
        split: {
          match: () => true,
          type: maybeHeading,
        },
      }
    );
    insertNode(
      editor,
      { children: [{ text: '' }], level: 1, type: 'heading' },
      {
        split: {
          // @ts-expect-error a predicate cannot select its own unchecked node type
          match: (node: SchemaElementFor<typeof ArticleSchema, 'paragraph'>) =>
            node.align !== undefined,
        },
      }
    );
    insertNodes(
      editor,
      [{ children: [{ text: '' }], level: 1, type: 'heading' }],
      {
        split: {
          match: (node) => node.align !== undefined,
          type: paragraph,
        },
      }
    );
    insertNodes(
      editor,
      [{ children: [{ text: '' }], level: 1, type: 'heading' }],
      {
        split: {
          match: () => true,
          type: maybeHeading,
        },
      }
    );
    insertNodes(
      editor,
      [{ children: [{ text: '' }], level: 1, type: 'heading' }],
      {
        split: {
          // @ts-expect-error plural insertion requires a structural selector before narrowing
          match: (node: SchemaElementFor<typeof ArticleSchema, 'paragraph'>) =>
            node.align !== undefined,
        },
      }
    );
  };

  void assertStaticTransformInference;
  void guardedEntry;
  void exactHeading;
  void headingParent;
  void incorrectlyRequiredParent;
  void maybeStaticParent;
  void requiredStaticParent;
  void rootAwareEntry;
  void rootAwareAbove;
  void headingEntry;
  void stringEntry;
  void staticRootAwareAbove;
  void unionEntries;
};

void assertNodeQueryInference;
