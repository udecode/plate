import {
  ContentSlice,
  createEditor,
  type Descendant,
  type Editor,
  type EditorExtension,
  defineExtension,
  defineEditorSchema,
  editorReads,
  type Node,
  property,
  type Range,
  schema,
  target,
  SelectionApi,
  type Element as PliteElement,
  ElementApi,
} from '@platejs/plite';
import { history } from '@platejs/plite-history';
import {
  addMark as editorAddMark,
  getLastCommit as editorGetLastCommit,
  getInternalDocumentChangeRootKeys,
  getNodeKey as editorGetNodeKey,
  getSnapshot as editorGetSnapshot,
  replace as editorReplace,
  string as editorString,
} from '@platejs/plite/internal';
import { JSDOM } from 'jsdom';

import {
  clipboardHandler,
  defineHostCodec,
  dom,
  hostCodecs,
  writeDOMFragmentData,
  writeDOMRangeData,
} from '../src/index';
import {
  DOMCoverage,
  EDITOR_TO_ELEMENT,
  EDITOR_TO_KEY_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
  readDOMFragmentData,
} from '../src/internal';

const editorGetChangedRoots = (editor: Editor) =>
  (editorGetLastCommit(editor)
    ? getInternalDocumentChangeRootKeys(editorGetLastCommit(editor)!.changes)
    : []
  ).map((root) => (root === 'main' ? null : root));

class FakeDataTransfer {
  private readonly store = new Map<string, string>();

  get types() {
    return Array.from(this.store.keys());
  }

  getData(type: string) {
    return this.store.get(type) ?? '';
  }

  setData(type: string, value: string) {
    this.store.set(type, value);
  }
}

const createChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [{ text: 'alpha' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'beta' }],
  },
];

const clipboardRichSchema = defineEditorSchema('schema:clipboard-rich-test', {
  elements: {
    image: {
      properties: { url: property.string() },
      void: 'block',
    },
    link: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
      properties: { url: property.string() },
    },
    mention: {
      properties: { character: property.string() },
      void: 'markable-inline',
    },
    paragraph: schema.element.textBlock({
      properties: {
        blockTone: property.string(),
      },
    }),
  },
  id: 'clipboard-rich-test',
  properties: [
    schema.elementProperty('transientLabel', property.string(), {
      role: 'metadata',
      target: target.type('paragraph'),
    }),
    schema.textProperty('emphasis', property.boolean()),
    schema.textProperty('transientMark', property.string(), {
      role: 'metadata',
    }),
  ],
  root: schema.content.group('block', {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const permissiveClipboardSchema = defineEditorSchema(
  'schema:clipboard-permissive-test',
  {
    elements: {},
    id: 'clipboard-permissive-test',
    root: schema.content.not(schema.content.text()),
    unknown: 'preserve',
    version: 1,
  }
);

const keyboardSelectableClipboardSchema = defineEditorSchema(
  'schema:keyboard-selectable-clipboard-test',
  {
    elements: {
      media: {
        content: schema.content.text({ default: 'text', min: 1 }),
        contentRoots: {
          details: {
            content: schema.content.type('paragraph', {
              default: { type: 'paragraph' },
              min: 1,
            }),
            ownership: 'exclusive',
          },
        },
        keyboardSelectable: true,
      },
      paragraph: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
    id: 'keyboard-selectable-clipboard-test',
    root: schema.content.types(['media', 'paragraph'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  }
);

const readOnlyInlinePasteExtension = defineExtension(
  'read-only-inline-paste-delegate',
  {
    contributions: [
      clipboardHandler({
        insertData(_data, { next }) {
          return next();
        },
      }),
    ],
    schema: {
      elements: {
        badge: {
          content: schema.content.text({ default: 'text', min: 1 }),
          inline: true,
          readOnly: true,
        },
      },
    },
  }
);

const inlineLinkPasteExtension = defineExtension('inline-link-paste', {
  schema: {
    elements: {
      link: {
        content: schema.content.text({ default: 'text', min: 1 }),
        inline: true,
      },
    },
  },
});

const nestedInlinePasteExtension = defineExtension('nested-inline-paste', {
  schema: {
    elements: {
      inner: {
        content: schema.content.text({ default: 'text', min: 1 }),
        inline: true,
      },
      outer: {
        content: schema.content.any(
          [schema.content.text(), schema.content.type('inner')],
          { default: 'text', min: 1 }
        ),
        inline: true,
      },
    },
  },
});

const getHistory = (editor: Editor) =>
  editor.read((state: any) => state.history());

const undo = (editor: Editor) => {
  editor.update((tx) => {
    tx.history.undo();
  });
};

const seedNodeMaps = (editor: Editor, children: Descendant[]) => {
  const visit = (parent: Editor | PliteElement, child: Node, index: number) => {
    NODE_TO_PARENT.set(child, parent);
    NODE_TO_INDEX.set(child, index);

    if (ElementApi.isElement(child)) {
      child.children.forEach((nested, nestedIndex) => {
        visit(child, nested, nestedIndex);
      });
    }
  };

  children.forEach((child, index) => {
    visit(editor, child, index);
  });
};

const createClipboardEditor = (
  children: Descendant[],
  selection: Range | null,
  clipboardFormatKey?: string,
  extensions: readonly EditorExtension[] = []
) => {
  const editor = createEditor({
    extensions: [
      dom(clipboardFormatKey ? { clipboardFormatKey } : {}),
      ...extensions,
    ],
    ...(selection ? { initialSelection: selection } : {}),
    initialValue: children,
  });

  seedNodeMaps(
    editor,
    editor.read((state) => state.runtime.snapshot().children)
  );

  return editor;
};

const withDom = (run: (document: Document) => void) => {
  const innerDom = new JSDOM('<!doctype html><html><body></body></html>');

  try {
    run(innerDom.window.document);
  } finally {
    innerDom.window.close();
  }
};

const mountEditorRoot = (editor: Editor, document: Document) => {
  const root = document.createElement('div');
  root.setAttribute('data-plite-editor', 'true');
  root.setAttribute('contenteditable', 'true');
  document.body.appendChild(root);

  EDITOR_TO_ELEMENT.set(editor, root);
  EDITOR_TO_WINDOW.set(editor, document.defaultView!);
  ELEMENT_TO_NODE.set(root, editor);
  NODE_TO_ELEMENT.set(editor, root);
  EDITOR_TO_KEY_TO_ELEMENT.set(
    editor,
    EDITOR_TO_KEY_TO_ELEMENT.get(editor) ?? new WeakMap()
  );

  return root;
};

const bindDOMNode = (editor: Editor, node: Node, element: HTMLElement) => {
  const key = editor.api.dom.findKey(node);

  EDITOR_TO_KEY_TO_ELEMENT.get(editor)!.set(key, element);
  ELEMENT_TO_NODE.set(element, node);
  NODE_TO_ELEMENT.set(node, element);
};

const createTextDOM = (document: Document, text: string) => {
  const owner = document.createElement('span');
  const leaf = document.createElement('span');
  const string = document.createElement('span');

  owner.setAttribute('data-plite-node', 'text');
  leaf.setAttribute('data-plite-leaf', 'true');
  string.setAttribute('data-plite-string', 'true');

  string.appendChild(document.createTextNode(text));
  leaf.appendChild(string);
  owner.appendChild(leaf);

  return owner;
};

const createZeroWidthTextDOM = (document: Document) => {
  const owner = document.createElement('span');
  const leaf = document.createElement('span');
  const zeroWidth = document.createElement('span');

  owner.setAttribute('data-plite-node', 'text');
  leaf.setAttribute('data-plite-leaf', 'true');
  zeroWidth.setAttribute('data-plite-zero-width', 'z');

  zeroWidth.appendChild(document.createTextNode('\uFEFF'));
  leaf.appendChild(zeroWidth);
  owner.appendChild(leaf);

  return owner;
};

const mountSimpleEditorDOM = (editor: Editor, document: Document) => {
  const root = mountEditorRoot(editor, document);

  for (const [blockIndex, block] of editor
    .read((state) => state.runtime.snapshot().children)
    .entries()) {
    const blockEl = document.createElement('div');
    blockEl.style.display = 'block';

    const owner = document.createElement('span');
    const leaf = document.createElement('span');
    const string = document.createElement('span');
    const textNode = document.createTextNode(block.children[0].text as string);

    owner.setAttribute('data-plite-node', 'text');
    leaf.setAttribute('data-plite-leaf', 'true');
    string.setAttribute('data-plite-string', 'true');

    string.appendChild(textNode);
    leaf.appendChild(string);
    owner.appendChild(leaf);
    blockEl.appendChild(owner);
    root.appendChild(blockEl);

    const [node] = editor.read((state) => state.nodes.get([blockIndex, 0]));
    bindDOMNode(editor, node, owner);
  }
};

const mountListEditorDOM = (editor: Editor, document: Document) => {
  const root = mountEditorRoot(editor, document);
  const list = document.createElement('ul');

  list.setAttribute('data-plite-node', 'element');

  for (const [itemIndex, item] of editor
    .read((state) => state.runtime.snapshot().children[0])
    .children.entries()) {
    const itemEl = document.createElement('li');
    const textEl = createTextDOM(
      document,
      ((item as PliteElement).children[0] as { text: string }).text
    );

    itemEl.setAttribute('data-plite-node', 'element');
    itemEl.appendChild(textEl);
    list.appendChild(itemEl);

    const [itemNode] = editor.read((state) => state.nodes.get([0, itemIndex]));
    const [textNode] = editor.read((state) =>
      state.nodes.get([0, itemIndex, 0])
    );

    bindDOMNode(editor, itemNode, itemEl);
    bindDOMNode(editor, textNode, textEl);
  }

  root.appendChild(list);

  const [listNode] = editor.read((state) => state.nodes.get([0]));
  bindDOMNode(editor, listNode, list);
};

const mountInlineVoidEditorDOM = (editor: Editor, document: Document) => {
  const root = mountEditorRoot(editor, document);
  const blockEl = document.createElement('p');
  const before = createTextDOM(document, 'alpha ');
  const mention = document.createElement('span');
  const mentionContent = document.createElement('span');
  const mentionHiddenText = createZeroWidthTextDOM(document);
  const after = createTextDOM(document, ' omega');

  blockEl.setAttribute('data-plite-node', 'element');
  mention.setAttribute('data-plite-node', 'element');
  mention.setAttribute('data-plite-inline', 'true');
  mention.setAttribute('data-plite-void', 'true');
  mention.setAttribute('contenteditable', 'false');
  mentionContent.setAttribute('contenteditable', 'false');
  mentionContent.textContent = '@R2-D2';

  mention.appendChild(mentionContent);
  mention.appendChild(mentionHiddenText);
  blockEl.appendChild(before);
  blockEl.appendChild(mention);
  blockEl.appendChild(after);
  root.appendChild(blockEl);

  const [blockNode] = editor.read((state) => state.nodes.get([0]));
  const [beforeNode] = editor.read((state) => state.nodes.get([0, 0]));
  const [mentionNode] = editor.read((state) => state.nodes.get([0, 1]));
  const [mentionTextNode] = editor.read((state) => state.nodes.get([0, 1, 0]));
  const [afterNode] = editor.read((state) => state.nodes.get([0, 2]));

  bindDOMNode(editor, blockNode, blockEl);
  bindDOMNode(editor, beforeNode, before);
  bindDOMNode(editor, mentionNode, mention);
  bindDOMNode(editor, mentionTextNode, mentionHiddenText);
  bindDOMNode(editor, afterNode, after);
};

const mountBlockVoidEditorDOM = (editor: Editor, document: Document) => {
  const root = mountEditorRoot(editor, document);
  const before = document.createElement('p');
  const beforeText = createTextDOM(document, 'before');
  const image = document.createElement('div');
  const imageContent = document.createElement('div');
  const img = document.createElement('img');
  const button = document.createElement('button');
  const spacer = document.createElement('span');
  const imageHiddenText = createZeroWidthTextDOM(document);
  const after = document.createElement('p');
  const afterText = createTextDOM(document, 'after');

  before.setAttribute('data-plite-node', 'element');
  before.appendChild(beforeText);

  image.setAttribute('data-plite-node', 'element');
  image.setAttribute('data-plite-void', 'true');
  image.style.position = 'relative';
  imageContent.setAttribute('contenteditable', 'false');
  img.setAttribute('src', 'https://example.com/image.png');
  button.textContent = 'delete';
  imageContent.appendChild(img);
  imageContent.appendChild(button);
  spacer.setAttribute('data-plite-spacer', 'true');
  spacer.appendChild(imageHiddenText);
  image.appendChild(imageContent);
  image.appendChild(spacer);

  after.setAttribute('data-plite-node', 'element');
  after.appendChild(afterText);

  root.appendChild(before);
  root.appendChild(image);
  root.appendChild(after);

  const [beforeNode] = editor.read((state) => state.nodes.get([0]));
  const [beforeTextNode] = editor.read((state) => state.nodes.get([0, 0]));
  const [imageNode] = editor.read((state) => state.nodes.get([1]));
  const [imageTextNode] = editor.read((state) => state.nodes.get([1, 0]));
  const [afterNode] = editor.read((state) => state.nodes.get([2]));
  const [afterTextNode] = editor.read((state) => state.nodes.get([2, 0]));

  bindDOMNode(editor, beforeNode, before);
  bindDOMNode(editor, beforeTextNode, beforeText);
  bindDOMNode(editor, imageNode, image);
  bindDOMNode(editor, imageTextNode, imageHiddenText);
  bindDOMNode(editor, afterNode, after);
  bindDOMNode(editor, afterTextNode, afterText);
};

const mountDecoratedEditorDOM = (editor: Editor, document: Document) => {
  const root = mountEditorRoot(editor, document);

  const blockEl = document.createElement('div');
  blockEl.style.display = 'block';

  const owner = document.createElement('span');
  const plainLeaf = document.createElement('span');
  const highlightedLeaf = document.createElement('span');
  const plainString = document.createElement('span');
  const highlightedWrapper = document.createElement('span');
  const highlightedString = document.createElement('span');

  owner.setAttribute('data-plite-node', 'text');
  plainLeaf.setAttribute('data-plite-leaf', 'true');
  highlightedLeaf.setAttribute('data-plite-leaf', 'true');
  plainString.setAttribute('data-plite-string', 'true');
  highlightedWrapper.setAttribute('data-tone', 'warm');
  highlightedString.setAttribute('data-plite-string', 'true');

  plainString.appendChild(document.createTextNode('a'));
  highlightedString.appendChild(document.createTextNode('lph'));
  highlightedWrapper.appendChild(highlightedString);
  plainLeaf.appendChild(plainString);
  highlightedLeaf.appendChild(highlightedWrapper);
  owner.appendChild(plainLeaf);
  owner.appendChild(highlightedLeaf);
  blockEl.appendChild(owner);
  root.appendChild(blockEl);

  const [node] = editor.read((state) => state.nodes.get([0, 0]));
  const key = editor.api.dom.findKey(node);
  EDITOR_TO_KEY_TO_ELEMENT.get(editor)!.set(key, owner);
  ELEMENT_TO_NODE.set(owner, node);
  NODE_TO_ELEMENT.set(node, owner);
};

const encodeFragmentPayload = (document: Document, payload: string) =>
  document.defaultView!.btoa(encodeURIComponent(payload));

const encodeRawFragmentPayload = (document: Document, payload: string) =>
  document.defaultView!.btoa(payload);

const decodeFragmentPayload = (document: Document, payload: string) =>
  JSON.parse(decodeURIComponent(document.defaultView!.atob(payload)));

const getNodeKey = (editor: Editor, path: number[]) => {
  const nodeKey = editorGetNodeKey(editor, path);

  if (!nodeKey) {
    throw new Error(`Missing node key at ${path.join('.')}`);
  }

  return nodeKey;
};

describe('plite-dom clipboard boundary', () => {
  it('writes explicit fragment payloads through the shared Plite DOM writer', () => {
    const data = new FakeDataTransfer();
    const fragment = [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ] satisfies Descendant[];

    const encoded = writeDOMFragmentData(data as unknown as DataTransfer, {
      clipboardFormatKey: 'x-custom-plite-fragment',
      html: ({ clipboardFormatKey, encoded: innerEncoded }) =>
        `<p data-plite-fragment="${innerEncoded}" data-plite-fragment-format="${clipboardFormatKey}">alpha</p>`,
      slice: ContentSlice.closed(fragment),
      text: 'alpha',
    });

    expect(encoded).not.toBe('');
    expect(data.getData('application/x-custom-plite-fragment')).toBe(encoded);
    expect(data.getData('text/plain')).toBe('alpha');
    expect(data.getData('text/html')).toBe(
      `<p data-plite-fragment="${encoded}" data-plite-fragment-format="x-custom-plite-fragment">alpha</p>`
    );
    expect(
      data.getData('text/html').match(/data-plite-fragment=/g)
    ).toHaveLength(1);
    expect(decodeFragmentPayload(document, encoded)).toEqual({
      slice: ContentSlice.closed(fragment),
      version: 1,
    });
  });

  it('keeps v1 bytes and openness for frozen editor fragments', () => {
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'alpha' }],
          type: 'paragraph',
        },
      ],
    });
    const slice = editor.read.slice.get({
      at: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
    });
    const data = new FakeDataTransfer();
    const encoded = writeDOMFragmentData(data as unknown as DataTransfer, {
      html: '<p>alpha</p>',
      slice,
      text: 'alpha',
    });

    expect(decodeURIComponent(document.defaultView!.atob(encoded))).toBe(
      '{"slice":{"content":[{"type":"paragraph","children":[{"text":"alpha"}]}],"openEnd":1,"openStart":1},"version":1}'
    );
  });

  it('round-trips detached secondary roots in the canonical fragment envelope', () => {
    const data = new FakeDataTransfer();
    const slice = ContentSlice.fromJSON({
      content: [
        {
          childRoots: { caption: 'caption:1' },
          children: [{ text: '' }],
          type: 'image',
        },
      ],
      openEnd: 0,
      openStart: 0,
      roots: {
        'caption:1': [
          { children: [{ bold: true, text: 'rich' }], type: 'paragraph' },
        ],
      },
    });
    const encoded = writeDOMFragmentData(data as unknown as DataTransfer, {
      html: '<figure></figure>',
      slice,
    });

    expect(decodeFragmentPayload(document, encoded)).toEqual({
      slice,
      version: 1,
    });
    expect(
      readDOMFragmentData(
        createEditor() as never,
        data as unknown as DataTransfer
      )
    ).toEqual(slice);
  });

  it('writes a node selection as one closed owner slice with reachable roots', () => {
    withDom((document) => {
      const owner = {
        childRoots: { details: 'media:1:details' },
        children: [{ text: 'Caption' }],
        type: 'media' as const,
      };
      const details = [
        { children: [{ text: 'Owned details' }], type: 'paragraph' as const },
      ];
      const point = { offset: 0, path: [1, 0] };
      const editor = createEditor({
        extensions: [dom(), keyboardSelectableClipboardSchema],
        initialSelection: SelectionApi.node([1], {
          anchor: point,
          focus: point,
        }),
        initialValue: {
          children: [
            { children: [{ text: 'before' }], type: 'paragraph' as const },
            owner,
            { children: [{ text: 'after' }], type: 'paragraph' as const },
          ],
          roots: { 'media:1:details': details },
        },
      });
      const clipboard = new FakeDataTransfer();

      editor.api.dom.clipboard.writeSelection(clipboard);

      const encoded = clipboard.getData('application/x-plite-fragment');

      expect(encoded).not.toBe('');
      expect(decodeFragmentPayload(document, encoded)).toEqual({
        slice: ContentSlice.fromJSON({
          content: [owner],
          openEnd: 0,
          openStart: 0,
          roots: { 'media:1:details': details },
        }),
        version: 1,
      });
      expect(clipboard.getData('text/plain')).toBe('Caption');
    });
  });

  it('writes current named-root text selections from their owning root', () => {
    withDom((document) => {
      const owner = {
        childRoots: { details: 'media:1:details' },
        children: [{ text: 'Caption' }],
        type: 'media' as const,
      };
      const details = [
        { children: [{ text: 'Owned details' }], type: 'paragraph' as const },
      ];
      const editor = createEditor({
        extensions: [dom(), keyboardSelectableClipboardSchema],
        initialSelection: SelectionApi.text({
          anchor: {
            offset: 0,
            path: [0, 0],
            root: 'media:1:details',
          },
          focus: {
            offset: 'Owned'.length,
            path: [0, 0],
            root: 'media:1:details',
          },
        }),
        initialValue: {
          children: [owner],
          roots: { 'media:1:details': details },
        },
      });
      const clipboard = new FakeDataTransfer();

      editor.api.dom.clipboard.writeSelection(clipboard);

      expect(clipboard.getData('text/plain')).toBe('Owned');
      expect(
        decodeFragmentPayload(
          document,
          clipboard.getData('application/x-plite-fragment')
        )
      ).toEqual({
        slice: ContentSlice.fromJSON({
          content: [
            { children: [{ text: 'Owned' }], type: 'paragraph' as const },
          ],
          openEnd: 1,
          openStart: 1,
        }),
        version: 1,
      });
    });
  });

  it('snapshots mutable fragment input before producing clipboard payloads', () => {
    const data = new FakeDataTransfer();
    const source = {
      content: createChildren().slice(0, 1),
      openEnd: 0,
      openStart: 0,
    };
    const encoded = writeDOMFragmentData(data as unknown as DataTransfer, {
      html: ({ text }) => {
        source.content[0].children[0] = { text: 'mutated' };

        return `<p>${text}</p>`;
      },
      slice: source,
    });

    expect(data.getData('text/plain')).toBe('alpha');
    expect(data.getData('text/html')).toContain('data-plite-fragment=');
    expect(data.getData('text/html')).toContain('>alpha</p>');
    expect(decodeFragmentPayload(document, encoded)).toEqual({
      slice: ContentSlice.closed([
        { children: [{ text: 'alpha' }], type: 'paragraph' },
      ]),
      version: 1,
    });
  });

  it('rejects hostile fragment input before writing any clipboard format', () => {
    const repeated = {
      children: [{ text: 'repeated' }],
      type: 'paragraph',
    };
    const accessor = {
      children: [{ text: 'accessor' }],
      type: 'paragraph',
    } as Record<string, unknown>;

    Object.defineProperty(accessor, 'payload', {
      enumerable: true,
      get: () => 'unsafe',
    });

    for (const slice of [
      { content: [repeated, repeated], openEnd: 0, openStart: 0 },
      { content: [accessor], openEnd: 0, openStart: 0 },
      {
        content: [
          {
            children: [{ text: 'non-json' }],
            payload: new Date(0),
            type: 'paragraph',
          },
        ],
        openEnd: 0,
        openStart: 0,
      },
    ]) {
      const data = new FakeDataTransfer();

      expect(() =>
        writeDOMFragmentData(data as unknown as DataTransfer, {
          html: '<p>must not write</p>',
          slice: slice as never,
        })
      ).toThrow();
      expect(data.types).toEqual([]);
    }
  });

  it('installs DOM host capabilities on the editor instance', () => {
    const editor = createEditor({ extensions: [dom()] });
    const headlessEditor = createEditor();

    expect('dom' in headlessEditor).toBe(false);
    expect('clipboard' in headlessEditor.api).toBe(false);
    expect(typeof editor.api.dom.clipboard.insertData).toBe('function');
    expect(typeof editor.api.dom.clipboard.readSlice).toBe('function');
    expect(typeof editor.api.dom.clipboard.writeSelection).toBe('function');
    expect(typeof editor.api.dom.clipboard.writeSlice).toBe('function');
    expect('clipboard' in editor).toBe(false);
  });

  it('distinguishes absent, malformed, and exact slice payloads', () => {
    const editor = createClipboardEditor(createChildren(), null);
    const absent = new FakeDataTransfer();
    const malformed = new FakeDataTransfer();
    const exact = new FakeDataTransfer();

    malformed.setData('application/x-plite-fragment', 'not-an-envelope');
    editor.api.dom.clipboard.writeSlice(exact, {
      slice: ContentSlice.closed([createChildren()[0]]),
    });

    expect(
      editor.api.dom.clipboard.readSlice(absent as unknown as DataTransfer)
    ).toEqual({ kind: 'absent' });
    expect(
      editor.api.dom.clipboard.readSlice(malformed as unknown as DataTransfer)
    ).toEqual({ kind: 'invalid', source: 'mime' });
    expect(
      editor.api.dom.clipboard.readSlice(exact as unknown as DataTransfer)
    ).toMatchObject({
      kind: 'slice',
      slice: { content: [createChildren()[0]] },
    });
  });

  it('rejects a second next call from one clipboard handler', () => {
    const editor = createClipboardEditor(createChildren(), null, undefined, [
      defineExtension('double-delegate', {
        contributions: [
          clipboardHandler({
            insertData(data, { next }) {
              next(data);

              return next(data);
            },
          }),
        ],
      }),
    ]);

    expect(() =>
      editor.api.dom.clipboard.insertData(
        new FakeDataTransfer() as unknown as DataTransfer
      )
    ).toThrow('DOM clipboard handler next() can only be called once.');
  });

  it('lets clipboard middleware consume app paste data and delegate fallback paste', () => {
    const seen: string[] = [];
    const editor = createClipboardEditor(
      [
        {
          type: 'paragraph',
          children: [{ text: 'beta' }],
        },
      ],
      {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
      undefined,
      [
        defineExtension('product-card-paste', {
          contributions: [
            clipboardHandler({
              insertData(data, { next, tx }) {
                expect(tx.tags.has('paste')).toBe(true);

                const title = data.getData('application/x-product-card-title');

                seen.push(
                  `${title ? 'consume' : 'delegate'}:${
                    tx.selection()?.anchor.offset ?? -1
                  }`
                );

                if (!title) {
                  return next();
                }

                tx.text.insert(`Card: ${title}`);
                return true;
              },
            }),
          ],
        }),
      ]
    );
    const productCard = new FakeDataTransfer();
    const plainText = new FakeDataTransfer();

    productCard.setData('application/x-product-card-title', 'Ada');
    productCard.setData('text/plain', 'fallback');
    plainText.setData('text/plain', '!');

    editor.update(() => {
      expect(
        editor.api.dom.clipboard.insertData(
          productCard as unknown as DataTransfer
        )
      ).toBe(true);
    });
    editor.update(() => {
      expect(
        editor.api.dom.clipboard.insertData(
          plainText as unknown as DataTransfer
        )
      ).toBe(true);
    });

    expect(editorString(editor, [0])).toBe('Card: Ada!beta');
    expect(seen).toEqual(['consume:0', 'delegate:9']);
  });

  it('round-trips a selected fragment through clipboard payloads and replaces the target selection', () => {
    withDom((document) => {
      const copySelection: Range = {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      const replaceSelection: Range = {
        kind: 'text',
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 4 },
      };

      const source = createClipboardEditor(createChildren(), copySelection);
      const innerTarget = createClipboardEditor(
        createChildren(),
        replaceSelection
      );
      const clipboard = new FakeDataTransfer();

      mountSimpleEditorDOM(source, document);
      mountEditorRoot(innerTarget, document);

      source.api.dom.clipboard.writeSelection(clipboard);

      expect(clipboard.getData('application/x-plite-fragment')).not.toBe('');
      expect(clipboard.getData('text/html')).toContain('data-plite-fragment=');
      expect(clipboard.getData('text/plain')).toBe('alpha');

      innerTarget.update(() => {
        innerTarget.api.dom.clipboard.insertData(clipboard);
      });

      expect(editorGetSnapshot(innerTarget).children).toEqual([
        {
          type: 'paragraph',
          children: [{ text: 'alpha' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'alpha' }],
        },
      ]);
      expect(editorGetSnapshot(innerTarget).selection).toEqual({
        kind: 'text',
        anchor: { path: [1, 0], offset: 5 },
        focus: { path: [1, 0], offset: 5 },
      });
    });
  });

  it('tags direct and composed clipboard insertion as one paste transaction', () => {
    const selection: Range = {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const createTarget = () =>
      createClipboardEditor(
        [{ children: [{ text: '' }], type: 'paragraph' }],
        selection
      );
    const createExactData = () => {
      const data = new FakeDataTransfer();

      writeDOMFragmentData(data as unknown as DataTransfer, {
        html: '<p>exact</p>',
        slice: ContentSlice.closed([
          { children: [{ text: 'exact' }], type: 'paragraph' },
        ]),
      });

      return data;
    };
    const assertOnePasteCommit = (editor: Editor, insert: () => boolean) => {
      let commits = 0;

      editor.subscribeCommit(() => (commits += 1) - 1);

      expect(insert()).toBe(true);
      expect(commits).toBe(1);
      expect(editorGetLastCommit(editor)?.tags).toContain('paste');
    };
    const fragmentTarget = createTarget();
    const fragmentData = createExactData();

    assertOnePasteCommit(fragmentTarget, () =>
      fragmentTarget.api.dom.clipboard.insertFragmentData(fragmentData)
    );

    const textTarget = createTarget();
    const textData = new FakeDataTransfer();

    textData.setData('text/plain', 'text');
    assertOnePasteCommit(textTarget, () =>
      textTarget.api.dom.clipboard.insertTextData(textData)
    );

    const composedTarget = createTarget();
    const composedData = createExactData();

    assertOnePasteCommit(composedTarget, () =>
      composedTarget.api.dom.clipboard.insertData(composedData)
    );
  });

  it('runs tx clipboard insertion in its supplied transaction and rolls back atomically', () => {
    const editor = createClipboardEditor(
      [{ children: [{ text: '' }], type: 'paragraph' }],
      {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      }
    );
    const clipboard = new FakeDataTransfer();
    const before = editorGetSnapshot(editor);
    let commits = 0;

    clipboard.setData('text/plain', 'transaction');
    editor.subscribeCommit(() => (commits += 1) - 1);

    expect(() => {
      editor.update((tx) => {
        expect(tx.dom.insertData(clipboard as unknown as DataTransfer)).toBe(
          true
        );
        throw new Error('rollback clipboard transaction');
      });
    }).toThrow('rollback clipboard transaction');

    expect(commits).toBe(0);
    expect(editorGetSnapshot(editor)).toEqual(before);

    editor.update((tx) => {
      expect(tx.dom.insertData(clipboard as unknown as DataTransfer)).toBe(
        true
      );
    });

    expect(commits).toBe(1);
    expect(editorGetLastCommit(editor)?.tags).toContain('paste');
    expect(editorString(editor, [0])).toBe('transaction');
  });

  it('tags exact and host pastes without treating significance as a clipboard filter', () => {
    const fragment = ContentSlice.closed([
      {
        blockTone: 'warm',
        children: [{ emphasis: true, text: 'copied', transientMark: 'local' }],
        transientLabel: 'metadata',
        type: 'paragraph',
      },
    ]);
    const selection: Range = {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const createTarget = (extensions: readonly EditorExtension[] = []) =>
      createClipboardEditor(
        [{ children: [{ text: '' }], type: 'paragraph' }],
        selection,
        undefined,
        [clipboardRichSchema, ...extensions]
      );
    const expected = [
      {
        blockTone: 'warm',
        children: [{ emphasis: true, text: 'copied', transientMark: 'local' }],
        transientLabel: 'metadata',
        type: 'paragraph',
      },
    ];
    const exactTarget = createTarget();
    const exact = new FakeDataTransfer();

    writeDOMFragmentData(exact as unknown as DataTransfer, {
      html: '<p>copied</p>',
      slice: fragment,
    });
    exactTarget.api.dom.clipboard.insertData(exact);

    expect(editorGetSnapshot(exactTarget).children).toEqual(expected);
    expect(editorGetLastCommit(exactTarget)?.tags).toContain('paste');

    const HostCodec = hostCodecs('content-property-paste', [
      defineHostCodec({
        format: 'application/x-content-property',
        key: 'content-property-paste',
        parse: () => fragment,
      }),
    ]);
    const hostTarget = createTarget([HostCodec]);
    const host = new FakeDataTransfer();

    host.setData('application/x-content-property', 'copied');
    hostTarget.api.dom.clipboard.insertData(host);

    expect(editorGetSnapshot(hostTarget).children).toEqual(expected);
    expect(editorGetLastCommit(hostTarget)?.tags).toContain('paste');
  });

  it('writes an explicit range without publishing or changing model selection', () => {
    withDom((document) => {
      const selection: Range = {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      const range: Range = {
        kind: 'text',
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 4 },
      };
      const editor = createClipboardEditor(createChildren(), selection);
      const clipboard = new FakeDataTransfer();
      const selectionBefore = editor.read.selection();
      let commits = 0;

      editor.subscribeCommit(() => (commits += 1) - 1);
      mountSimpleEditorDOM(editor, document);

      writeDOMRangeData(editor, clipboard as unknown as DataTransfer, range);

      expect(clipboard.getData('text/plain')).toBe('beta');
      expect(clipboard.getData('application/x-plite-fragment')).not.toBe('');
      expect(clipboard.getData('text/html')).toContain('data-plite-fragment=');
      expect(editor.read.selection()).toEqual(selectionBefore);
      expect(commits).toBe(0);
    });
  });

  it('applies export projections to clipboard fragment payloads', () => {
    withDom((document) => {
      const range: Range = {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      };
      const editor = createClipboardEditor(
        [{ children: [{ text: 'beta' }], type: 'paragraph' }],
        range,
        undefined,
        [
          defineExtension('clipboard-export-projection', {
            readMiddleware: ({ around }) => [
              around(editorReads.slice.export, ({ next }) => {
                const slice = next();

                return ContentSlice.fromJSON({
                  ...slice,
                  content: slice.content.map((node) =>
                    ElementApi.isElement(node)
                      ? {
                          ...node,
                          children: node.children.map((child) =>
                            ElementApi.isElement(child)
                              ? child
                              : { ...child, text: child.text.toUpperCase() }
                          ),
                        }
                      : node
                  ),
                });
              }),
            ],
          }),
        ]
      );
      const clipboard = new FakeDataTransfer();

      mountSimpleEditorDOM(editor, document);
      writeDOMRangeData(editor, clipboard as unknown as DataTransfer, range);

      expect(
        decodeFragmentPayload(
          document,
          clipboard.getData('application/x-plite-fragment')
        )
      ).toMatchObject({
        slice: {
          content: [
            {
              children: [{ text: 'BETA' }],
              type: 'paragraph',
            },
          ],
        },
      });
    });
  });

  it('keeps the native fragment fallback when a host codec serializes HTML', () => {
    withDom((document) => {
      const source = createClipboardEditor(
        createChildren(),
        {
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 5 },
        },
        undefined,
        [
          hostCodecs('host-html-copy', [
            defineHostCodec({
              format: 'text/html',
              key: 'host-html-copy',
              serialize: () =>
                '<strong data-plite-fragment="stale">host-alpha</strong>',
            }),
          ]),
        ]
      );
      const innerTarget2 = createClipboardEditor(createChildren(), {
        kind: 'text',
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 4 },
      });
      const clipboard = new FakeDataTransfer();

      mountSimpleEditorDOM(source, document);
      mountEditorRoot(innerTarget2, document);

      source.api.dom.clipboard.writeSelection(clipboard);

      const html = clipboard.getData('text/html');

      expect(html).toContain('<strong');
      expect(html).toContain('host-alpha');
      expect(html).toContain('data-plite-fragment=');
      expect(clipboard.getData('application/x-plite-fragment')).not.toBe('');

      const htmlOnlyClipboard = new FakeDataTransfer();

      htmlOnlyClipboard.setData('text/html', html);
      innerTarget2.update(() => {
        innerTarget2.api.dom.clipboard.insertData(htmlOnlyClipboard);
      });

      expect(editorGetSnapshot(innerTarget2).children).toEqual([
        {
          type: 'paragraph',
          children: [{ text: 'alpha' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'alpha' }],
        },
      ]);
    });
  });

  it('orders exact v1, host codec, and plain-text fallback deterministically', () => {
    withDom((document) => {
      const createTarget = () => {
        const innerTarget3 = createClipboardEditor(
          [
            {
              type: 'paragraph',
              children: [{ text: 'target' }],
            },
          ],
          {
            kind: 'text',
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 'target'.length },
          },
          undefined,
          [
            hostCodecs('host-html-paste', [
              defineHostCodec({
                format: 'text/html',
                key: 'host-html-paste',
                parse: ({ data }) =>
                  data === '<p>host</p>'
                    ? ContentSlice.closed([
                        {
                          type: 'paragraph',
                          children: [{ text: 'host' }],
                        },
                      ])
                    : null,
              }),
            ]),
          ]
        );

        mountEditorRoot(innerTarget3, document);

        return innerTarget3;
      };
      const exact = new FakeDataTransfer();

      writeDOMFragmentData(exact as unknown as DataTransfer, {
        html: '<p>host</p>',
        slice: ContentSlice.closed([
          { children: [{ text: 'exact' }], type: 'paragraph' },
        ]),
        text: 'plain',
        window: {
          btoa: (value) => document.defaultView!.btoa(value),
        },
      });

      const exactTarget = createTarget();

      exactTarget.api.dom.clipboard.insertData(exact);
      expect(editorString(exactTarget, [0])).toBe('exact');

      const host = new FakeDataTransfer();
      const unsupportedEnvelope = encodeFragmentPayload(
        document,
        JSON.stringify({
          slice: ContentSlice.closed([
            { children: [{ text: 'wrong' }], type: 'paragraph' },
          ]),
          version: 2,
        })
      );

      host.setData('application/x-plite-fragment', unsupportedEnvelope);
      host.setData('text/html', '<p>host</p>');
      host.setData('text/plain', 'plain');

      const hostTarget = createTarget();

      hostTarget.api.dom.clipboard.insertData(host);
      expect(editorString(hostTarget, [0])).toBe('host');

      const plain = new FakeDataTransfer();

      plain.setData('text/html', '<p>miss</p>');
      plain.setData('text/plain', 'plain');

      const plainTarget = createTarget();

      plainTarget.api.dom.clipboard.insertData(plain);
      expect(editorString(plainTarget, [0])).toBe('plain');
    });
  });

  it('serializes empty paragraphs as blank lines in plain text clipboard output', () => {
    withDom((document) => {
      const source = createClipboardEditor(
        [
          {
            type: 'paragraph',
            children: [{ text: '1' }],
          },
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
          {
            type: 'paragraph',
            children: [{ text: '2' }],
          },
        ],
        {
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [2, 0], offset: 1 },
        }
      );
      const clipboard = new FakeDataTransfer();

      mountSimpleEditorDOM(source, document);

      source.api.dom.clipboard.writeSelection(clipboard);

      expect(clipboard.getData('text/plain').trimEnd()).toBe('1\n\n2');
      expect(clipboard.getData('text/html')).toContain('data-plite-fragment=');
    });
  });

  it('serializes space-only and empty paragraphs as distinct plain text lines', () => {
    withDom((document) => {
      const source = createClipboardEditor(
        [
          {
            type: 'paragraph',
            children: [{ text: 'Line 1' }],
          },
          {
            type: 'paragraph',
            children: [{ text: ' ' }],
          },
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'Line 4' }],
          },
        ],
        {
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [3, 0], offset: 'Line 4'.length },
        }
      );
      const clipboard = new FakeDataTransfer();

      mountSimpleEditorDOM(source, document);

      source.api.dom.clipboard.writeSelection(clipboard);

      expect(clipboard.getData('text/plain').trimEnd()).toBe(
        'Line 1\n \n\nLine 4'
      );
      expect(clipboard.getData('text/html')).toContain('data-plite-fragment=');
    });
  });

  it('copies a selected whole list to clipboard data without DOM range traversal errors', () => {
    withDom((document) => {
      const children: Descendant[] = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [{ text: 'one' }],
            },
            {
              type: 'list-item',
              children: [{ text: 'two' }],
            },
          ],
        },
      ];
      const source = createClipboardEditor(children, {
        kind: 'text',
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 1, 0], offset: 'two'.length },
      });
      const clipboard = new FakeDataTransfer();

      mountListEditorDOM(source, document);

      expect(() => {
        source.api.dom.clipboard.writeSelection(clipboard);
      }).not.toThrow();

      const encoded = clipboard.getData('application/x-plite-fragment');

      expect(encoded).not.toBe('');
      expect(decodeFragmentPayload(document, encoded)).toEqual({
        slice: ContentSlice.fromJSON({
          content: children,
          openEnd: 2,
          openStart: 2,
        }),
        version: 1,
      });
      expect(clipboard.getData('text/html')).toContain('data-plite-fragment=');
      expect(clipboard.getData('text/plain')).toContain('one');
      expect(clipboard.getData('text/plain')).toContain('two');
    });
  });

  it('does not emit hidden model fragments for summary coverage copy policy', () => {
    withDom((document) => {
      const source = createClipboardEditor(createChildren(), {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      });
      const clipboard = new FakeDataTransfer();

      mountSimpleEditorDOM(source, document);
      DOMCoverage.registerBoundary(source, {
        boundaryId: 'summary-alpha',
        anchor: { type: 'placeholder', nodeKey: getNodeKey(source, [0]) },
        copyPolicy: 'summary',
        coveredPathRanges: [{ kind: 'text', anchor: [0, 0], focus: [0, 0] }],
        coveredRuntimeRanges: [],
        findPolicy: 'native',
        ownerPath: [0],
        ownerNodeKey: getNodeKey(source, [0]),
        reason: 'app-collapse',
        selectionPolicy: 'skip',
        state: 'intentionally-hidden',
        version: 1,
      });

      source.api.dom.clipboard.writeSelection(clipboard);

      expect(clipboard.getData('text/plain')).toBe('alpha');
      expect(clipboard.getData('text/html')).not.toContain(
        'data-plite-fragment='
      );
      expect(clipboard.getData('application/x-plite-fragment')).toBe('');
    });
  });

  it('preserves the target block type when a rich fragment replaces selected target text', () => {
    withDom((document) => {
      const copySelection: Range = {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      const replaceSelection: Range = {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      };

      const source = createClipboardEditor(createChildren(), copySelection);
      const innerTarget4 = createClipboardEditor(
        [
          {
            type: 'heading',
            children: [{ text: 'beta' }],
          },
        ],
        replaceSelection
      );
      const clipboard = new FakeDataTransfer();

      mountSimpleEditorDOM(source, document);
      mountEditorRoot(innerTarget4, document);

      source.api.dom.clipboard.writeSelection(clipboard);

      innerTarget4.update(() => {
        innerTarget4.api.dom.clipboard.insertData(clipboard);
      });

      expect(editorGetSnapshot(innerTarget4).children).toEqual([
        {
          type: 'heading',
          children: [{ text: 'alpha' }],
        },
      ]);
      expect(editorGetSnapshot(innerTarget4).selection).toEqual({
        kind: 'text',
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 },
      });
    });
  });

  it('preserves block separation when a rich multi-block fragment is pasted in the middle of a text block', () => {
    withDom((document) => {
      const copySelection: Range = {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 'two'.length },
      };
      const targetSelection: Range = {
        kind: 'text',
        anchor: { path: [0, 0], offset: 'before '.length },
        focus: { path: [0, 0], offset: 'before '.length },
      };

      const source = createClipboardEditor(
        [
          {
            type: 'paragraph',
            children: [{ text: 'one' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'two' }],
          },
        ],
        copySelection
      );
      const innerTarget5 = createClipboardEditor(
        [
          {
            type: 'paragraph',
            children: [{ text: 'before after' }],
          },
        ],
        targetSelection
      );
      const clipboard = new FakeDataTransfer();

      mountSimpleEditorDOM(source, document);
      mountEditorRoot(innerTarget5, document);

      source.api.dom.clipboard.writeSelection(clipboard);

      expect(clipboard.getData('application/x-plite-fragment')).not.toBe('');
      expect(clipboard.getData('text/html')).toContain('data-plite-fragment=');
      expect(clipboard.getData('text/plain').trimEnd()).toBe('one\ntwo');

      innerTarget5.update(() => {
        innerTarget5.api.dom.clipboard.insertData(clipboard);
      });

      expect(editorGetSnapshot(innerTarget5).children).toEqual([
        {
          type: 'paragraph',
          children: [{ text: 'before one' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'twoafter' }],
        },
      ]);
      expect(editorGetSnapshot(innerTarget5).selection).toEqual({
        kind: 'text',
        anchor: { path: [1, 0], offset: 'two'.length },
        focus: { path: [1, 0], offset: 'two'.length },
      });
      expect(editorGetChangedRoots(innerTarget5)).toEqual([null]);
    });
  });

  it('keeps the target context for the first open block and promotes the tail', () => {
    withDom((document) => {
      const copySelection: Range = {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 'Some text'.length },
      };
      const targetSelection: Range = {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      const source = createClipboardEditor(
        [
          {
            type: 'paragraph',
            children: [{ text: 'Hello world' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'Some text' }],
          },
        ],
        copySelection
      );
      const innerTarget6 = createClipboardEditor(
        [
          {
            type: 'block-quote',
            children: [{ text: '' }],
          },
        ],
        targetSelection
      );
      const clipboard = new FakeDataTransfer();

      mountSimpleEditorDOM(source, document);
      mountEditorRoot(innerTarget6, document);

      source.api.dom.clipboard.writeSelection(clipboard);

      innerTarget6.update(() => {
        innerTarget6.api.dom.clipboard.insertData(clipboard);
      });

      expect(editorGetSnapshot(innerTarget6).children).toEqual([
        {
          type: 'block-quote',
          children: [{ text: 'Hello world' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'Some text' }],
        },
      ]);
      expect(editorGetSnapshot(innerTarget6).selection).toEqual({
        kind: 'text',
        anchor: { path: [1, 0], offset: 'Some text'.length },
        focus: { path: [1, 0], offset: 'Some text'.length },
      });
      expect(editorGetChangedRoots(innerTarget6)).toEqual([null]);
    });
  });

  it('does not add empty text leaves when pasting a full multi-block fragment', () => {
    withDom((document) => {
      const copySelection: Range = {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 'second block'.length },
      };
      const targetSelection: Range = {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      const source = createClipboardEditor(
        [
          {
            type: 'paragraph',
            children: [{ text: 'first block' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'second block' }],
          },
        ],
        copySelection
      );
      const innerTarget7 = createClipboardEditor(
        [
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
        ],
        targetSelection
      );
      const clipboard = new FakeDataTransfer();

      mountSimpleEditorDOM(source, document);
      mountEditorRoot(innerTarget7, document);

      source.api.dom.clipboard.writeSelection(clipboard);

      innerTarget7.update(() => {
        innerTarget7.api.dom.clipboard.insertData(clipboard);
      });

      expect(editorGetSnapshot(innerTarget7).children).toEqual([
        {
          type: 'paragraph',
          children: [{ text: 'first block' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'second block' }],
        },
      ]);
    });
  });

  it('replaces selected content that starts with an empty block when pasting', () => {
    withDom((document) => {
      const copySelection: Range = {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 'replacement'.length },
      };
      const targetSelection: Range = {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 'old content'.length },
      };

      const source = createClipboardEditor(
        [
          {
            type: 'paragraph',
            children: [{ text: 'replacement' }],
          },
        ],
        copySelection
      );
      const innerTarget8 = createClipboardEditor(
        [
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'old content' }],
          },
        ],
        targetSelection
      );
      const clipboard = new FakeDataTransfer();

      mountSimpleEditorDOM(source, document);
      mountEditorRoot(innerTarget8, document);

      source.api.dom.clipboard.writeSelection(clipboard);

      innerTarget8.update(() => {
        innerTarget8.api.dom.clipboard.insertData(clipboard);
      });

      expect(editorGetSnapshot(innerTarget8).children).toEqual([
        {
          type: 'paragraph',
          children: [{ text: 'replacement' }],
        },
      ]);
      expect(editorGetSnapshot(innerTarget8).selection).toEqual({
        kind: 'text',
        anchor: { path: [0, 0], offset: 'replacement'.length },
        focus: { path: [0, 0], offset: 'replacement'.length },
      });
    });
  });

  it('replaces selected content that starts with an empty block with multiple pasted blocks', () => {
    withDom((document) => {
      const copySelection: Range = {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 'second replacement'.length },
      };
      const targetSelection: Range = {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 'old content'.length },
      };

      const source = createClipboardEditor(
        [
          {
            type: 'paragraph',
            children: [{ text: 'first replacement' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'second replacement' }],
          },
        ],
        copySelection
      );
      const innerTarget9 = createClipboardEditor(
        [
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'old content' }],
          },
        ],
        targetSelection
      );
      const clipboard = new FakeDataTransfer();

      mountSimpleEditorDOM(source, document);
      mountEditorRoot(innerTarget9, document);

      source.api.dom.clipboard.writeSelection(clipboard);

      innerTarget9.update(() => {
        innerTarget9.api.dom.clipboard.insertData(clipboard);
      });

      expect(editorGetSnapshot(innerTarget9).children).toEqual([
        {
          type: 'paragraph',
          children: [{ text: 'first replacement' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'second replacement' }],
        },
      ]);
      expect(editorGetSnapshot(innerTarget9).selection).toEqual({
        kind: 'text',
        anchor: { path: [1, 0], offset: 'second replacement'.length },
        focus: { path: [1, 0], offset: 'second replacement'.length },
      });
    });
  });

  it('supports a custom fragment MIME key', () => {
    withDom((document) => {
      const selection: Range = {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      const replaceSelection: Range = {
        kind: 'text',
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 4 },
      };

      const source = createClipboardEditor(
        createChildren(),
        selection,
        'x-proof-fragment'
      );
      const innerTarget10 = createClipboardEditor(
        createChildren(),
        replaceSelection,
        'x-proof-fragment'
      );
      const clipboard = new FakeDataTransfer();

      mountSimpleEditorDOM(source, document);
      mountEditorRoot(innerTarget10, document);

      source.api.dom.clipboard.writeSelection(clipboard);

      expect(clipboard.getData('application/x-plite-fragment')).toBe('');
      expect(clipboard.getData('application/x-proof-fragment')).not.toBe('');

      innerTarget10.update(() => {
        innerTarget10.api.dom.clipboard.insertData(clipboard);
      });

      expect(editorGetSnapshot(innerTarget10).children[1].children[0]).toEqual({
        text: 'alpha',
      });
    });
  });

  it('falls back to the HTML embedded fragment when the custom MIME payload is absent', () => {
    withDom((document) => {
      const selection: Range = {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      const replaceSelection: Range = {
        kind: 'text',
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 4 },
      };

      const source = createClipboardEditor(createChildren(), selection);
      const innerTarget11 = createClipboardEditor(
        createChildren(),
        replaceSelection
      );
      const encodedClipboard = new FakeDataTransfer();
      const clipboard = new FakeDataTransfer();

      mountSimpleEditorDOM(source, document);
      mountEditorRoot(innerTarget11, document);

      source.api.dom.clipboard.writeSelection(encodedClipboard);
      clipboard.setData('text/html', encodedClipboard.getData('text/html'));

      innerTarget11.update(() => {
        innerTarget11.api.dom.clipboard.insertData(clipboard);
      });

      expect(editorGetSnapshot(innerTarget11).children[1].children[0]).toEqual({
        text: 'alpha',
      });
    });
  });

  it('accepts custom-key embedded HTML fragments in matching custom-key editors', () => {
    withDom((document) => {
      const selection: Range = {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      const replaceSelection: Range = {
        kind: 'text',
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 4 },
      };

      const source = createClipboardEditor(
        createChildren(),
        selection,
        'x-proof-fragment'
      );
      const innerTarget12 = createClipboardEditor(
        createChildren(),
        replaceSelection,
        'x-proof-fragment'
      );
      const encodedClipboard = new FakeDataTransfer();
      const clipboard = new FakeDataTransfer();

      mountSimpleEditorDOM(source, document);
      mountEditorRoot(innerTarget12, document);

      source.api.dom.clipboard.writeSelection(encodedClipboard);
      clipboard.setData('text/html', encodedClipboard.getData('text/html'));
      clipboard.setData('text/plain', 'plain fallback');

      innerTarget12.update(() => {
        innerTarget12.api.dom.clipboard.insertData(clipboard);
      });

      expect(editorGetSnapshot(innerTarget12).children[1].children[0]).toEqual({
        text: 'alpha',
      });
    });
  });

  it('rejects custom-key embedded HTML fragments in default-key editors', () => {
    withDom((document) => {
      const selection: Range = {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      const replaceSelection: Range = {
        kind: 'text',
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 4 },
      };

      const source = createClipboardEditor(
        createChildren(),
        selection,
        'x-proof-fragment'
      );
      const innerTarget13 = createClipboardEditor(
        createChildren(),
        replaceSelection
      );
      const encodedClipboard = new FakeDataTransfer();
      const clipboard = new FakeDataTransfer();

      mountSimpleEditorDOM(source, document);
      mountEditorRoot(innerTarget13, document);

      source.api.dom.clipboard.writeSelection(encodedClipboard);
      clipboard.setData('text/html', encodedClipboard.getData('text/html'));
      clipboard.setData('text/plain', 'plain fallback');

      innerTarget13.update(() => {
        innerTarget13.api.dom.clipboard.insertData(clipboard);
      });

      expect(editorGetSnapshot(innerTarget13).children[1].children[0]).toEqual({
        text: 'plain fallback',
      });
    });
  });

  it('falls back to plain text when no fragment payload exists', () => {
    const editor = createClipboardEditor(
      createChildren(),
      {
        kind: 'text',
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 4 },
      },
      undefined
    );
    const clipboard = new FakeDataTransfer();

    clipboard.setData('text/plain', 'hello');

    editor.update(() => {
      editor.api.dom.clipboard.insertData(clipboard);
    });

    expect(editorGetSnapshot(editor).children[1].children[0]).toEqual({
      text: 'hello',
    });
  });

  it('pastes plain text immediately before a read-only inline', () => {
    const prefix = 'before ';
    const editor = createClipboardEditor(
      [
        {
          type: 'paragraph',
          children: [
            { text: prefix },
            {
              type: 'badge',
              children: [{ text: 'Approved' }],
            },
            { text: '.' },
          ],
        },
      ],
      {
        kind: 'text',
        anchor: { path: [0, 0], offset: prefix.length },
        focus: { path: [0, 0], offset: prefix.length },
      },
      undefined,
      [permissiveClipboardSchema, readOnlyInlinePasteExtension]
    );
    const clipboard = new FakeDataTransfer();

    expect(editorGetSnapshot(editor).children).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: prefix },
          {
            type: 'badge',
            children: [{ text: 'Approved' }],
          },
          { text: '.' },
        ],
      },
    ]);
    clipboard.setData('text/plain', 'PASTE ');

    expect(
      editor.api.dom.clipboard.insertData(clipboard as unknown as DataTransfer)
    ).toBe(true);
    expect(editorGetSnapshot(editor).children).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'before PASTE ' },
          {
            type: 'badge',
            children: [{ text: 'Approved' }],
          },
          { text: '.' },
        ],
      },
    ]);
    expect(editorGetSnapshot(editor).selection).toEqual({
      kind: 'text',
      anchor: { path: [0, 0], offset: 'before PASTE '.length },
      focus: { path: [0, 0], offset: 'before PASTE '.length },
    });
  });

  it('pastes plain text inside an inline without splitting it', () => {
    const editor = createClipboardEditor(
      [
        {
          type: 'paragraph',
          children: [
            { text: 'before ' },
            {
              type: 'link',
              url: 'https://example.com',
              children: [{ text: 'hyperlink' }],
            },
            { text: ' after' },
          ],
        },
      ],
      {
        kind: 'text',
        anchor: { path: [0, 1, 0], offset: 'hyper'.length },
        focus: { path: [0, 1, 0], offset: 'hyper'.length },
      },
      undefined,
      [permissiveClipboardSchema, inlineLinkPasteExtension]
    );
    const clipboard = new FakeDataTransfer();

    clipboard.setData('text/plain', 'TEXT');

    expect(
      editor.api.dom.clipboard.insertData(clipboard as unknown as DataTransfer)
    ).toBe(true);
    expect(editorGetSnapshot(editor).children).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'before ' },
          {
            type: 'link',
            url: 'https://example.com',
            children: [{ text: 'hyperTEXTlink' }],
          },
          { text: ' after' },
        ],
      },
    ]);
    expect(editorGetSnapshot(editor).selection).toEqual({
      kind: 'text',
      anchor: { path: [0, 1, 0], offset: 'hyperTEXT'.length },
      focus: { path: [0, 1, 0], offset: 'hyperTEXT'.length },
    });
  });

  it('keeps multiline plain text structural inside an inline', () => {
    const editor = createClipboardEditor(
      [
        {
          type: 'paragraph',
          children: [
            { text: 'before ' },
            {
              type: 'link',
              url: 'https://example.com',
              children: [{ text: 'hyperlink' }],
            },
            { text: ' after' },
          ],
        },
      ],
      {
        kind: 'text',
        anchor: { path: [0, 1, 0], offset: 'hyper'.length },
        focus: { path: [0, 1, 0], offset: 'hyper'.length },
      },
      undefined,
      [permissiveClipboardSchema, inlineLinkPasteExtension]
    );
    const clipboard = new FakeDataTransfer();

    clipboard.setData('text/plain', 'A\nB');

    expect(
      editor.api.dom.clipboard.insertData(clipboard as unknown as DataTransfer)
    ).toBe(true);
    expect(editorGetSnapshot(editor).children).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'before ' },
          {
            type: 'link',
            url: 'https://example.com',
            children: [{ text: 'hyper' }],
          },
          { text: 'A' },
        ],
      },
      {
        type: 'paragraph',
        children: [
          { text: 'B' },
          {
            type: 'link',
            url: 'https://example.com',
            children: [{ text: 'link' }],
          },
          { text: ' after' },
        ],
      },
    ]);
    expect(editorGetSnapshot(editor).selection).toEqual({
      kind: 'text',
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 1 },
    });
  });

  it('preserves every consecutive editable inline ancestor for plain text', () => {
    const editor = createClipboardEditor(
      [
        {
          type: 'paragraph',
          children: [
            { text: 'before ' },
            {
              kind: 'outer',
              type: 'outer',
              children: [
                { text: '' },
                {
                  kind: 'inner',
                  type: 'inner',
                  children: [{ text: 'hyperlink' }],
                },
                { text: '' },
              ],
            },
            { text: ' after' },
          ],
        },
      ],
      {
        kind: 'text',
        anchor: { path: [0, 1, 1, 0], offset: 'hyper'.length },
        focus: { path: [0, 1, 1, 0], offset: 'hyper'.length },
      },
      undefined,
      [permissiveClipboardSchema, nestedInlinePasteExtension]
    );
    const clipboard = new FakeDataTransfer();

    clipboard.setData('text/plain', 'TEXT');

    expect(
      editor.api.dom.clipboard.insertData(clipboard as unknown as DataTransfer)
    ).toBe(true);
    expect(editorGetSnapshot(editor).children).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'before ' },
          {
            kind: 'outer',
            type: 'outer',
            children: [
              { text: '' },
              {
                kind: 'inner',
                type: 'inner',
                children: [{ text: 'hyperTEXTlink' }],
              },
              { text: '' },
            ],
          },
          { text: ' after' },
        ],
      },
    ]);
    expect(editorGetSnapshot(editor).selection).toEqual({
      kind: 'text',
      anchor: { path: [0, 1, 1, 0], offset: 'hyperTEXT'.length },
      focus: { path: [0, 1, 1, 0], offset: 'hyperTEXT'.length },
    });
  });

  it('appends plain text at the document end when selection is absent', () => {
    const editor = createClipboardEditor(createChildren(), null);
    const clipboard = new FakeDataTransfer();

    clipboard.setData('text/plain', 'hello');

    expect(
      editor.api.dom.clipboard.insertData(clipboard as unknown as DataTransfer)
    ).toBe(true);
    expect(editorGetSnapshot(editor).children).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'betahello' }],
      },
    ]);
    expect(editorGetSnapshot(editor).selection).toEqual({
      kind: 'text',
      anchor: { path: [1, 0], offset: 'betahello'.length },
      focus: { path: [1, 0], offset: 'betahello'.length },
    });
  });

  it('applies collapsed active marks to plain text fallback', () => {
    const editor = createClipboardEditor(createChildren(), {
      kind: 'text',
      anchor: { path: [1, 0], offset: 4 },
      focus: { path: [1, 0], offset: 4 },
    });
    const clipboard = new FakeDataTransfer();

    editorAddMark(editor, 'bold', true);
    clipboard.setData('text/plain', 'hello');

    editor.update(() => {
      editor.api.dom.clipboard.insertData(clipboard);
    });

    expect(editorGetSnapshot(editor).children[1].children).toEqual([
      { text: 'beta' },
      { bold: true, text: 'hello' },
    ]);
    expect(editorGetSnapshot(editor).selection).toEqual({
      kind: 'text',
      anchor: { path: [1, 1], offset: 'hello'.length },
      focus: { path: [1, 1], offset: 'hello'.length },
    });
  });

  it('inherits marks from the collapsed target leaf for plain text fallback', () => {
    const editor = createClipboardEditor(
      [
        {
          type: 'paragraph',
          children: [{ text: 'plain' }, { bold: true, text: 'marked' }],
        },
      ],
      {
        kind: 'text',
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 1], offset: 0 },
      }
    );
    const clipboard = new FakeDataTransfer();

    clipboard.setData('text/plain', 'hello');

    expect(
      editor.api.dom.clipboard.insertData(clipboard as unknown as DataTransfer)
    ).toBe(true);
    expect(editorGetSnapshot(editor).children).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'plain' }, { bold: true, text: 'hellomarked' }],
      },
    ]);
    expect(editorGetSnapshot(editor).selection).toEqual({
      kind: 'text',
      anchor: { path: [0, 1], offset: 'hello'.length },
      focus: { path: [0, 1], offset: 'hello'.length },
    });
  });

  it('applies collapsed active marks to multiline plain text fallback', () => {
    const editor = createClipboardEditor(
      [
        {
          type: 'paragraph',
          children: [{ text: 'Hello ' }],
        },
      ],
      {
        kind: 'text',
        anchor: { path: [0, 0], offset: 'Hello '.length },
        focus: { path: [0, 0], offset: 'Hello '.length },
      }
    );
    const clipboard = new FakeDataTransfer();

    editorAddMark(editor, 'bold', true);
    clipboard.setData('text/plain', 'world\nNext');

    editor.update(() => {
      editor.api.dom.clipboard.insertData(clipboard);
    });

    expect(editorGetSnapshot(editor).children).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'Hello ' }, { bold: true, text: 'world' }],
      },
      {
        type: 'paragraph',
        children: [{ bold: true, text: 'Next' }],
      },
    ]);
    expect(editorGetSnapshot(editor).selection).toEqual({
      kind: 'text',
      anchor: { path: [1, 0], offset: 'Next'.length },
      focus: { path: [1, 0], offset: 'Next'.length },
    });
  });

  it('applies collapsed active marks to multiline plain text replacing an empty block', () => {
    const editor = createClipboardEditor(
      [
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ],
      {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      }
    );
    const clipboard = new FakeDataTransfer();

    editorAddMark(editor, 'bold', true);
    clipboard.setData('text/plain', 'One\nTwo');

    editor.update(() => {
      editor.api.dom.clipboard.insertData(clipboard);
    });

    expect(editorGetSnapshot(editor).children).toEqual([
      {
        type: 'paragraph',
        children: [{ bold: true, text: 'One' }],
      },
      {
        type: 'paragraph',
        children: [{ bold: true, text: 'Two' }],
      },
    ]);
    expect(editorGetSnapshot(editor).selection).toEqual({
      kind: 'text',
      anchor: { path: [1, 0], offset: 'Two'.length },
      focus: { path: [1, 0], offset: 'Two'.length },
    });
  });

  it('keeps plain-text fallback outside selected inline text', () => {
    const editor = createClipboardEditor(
      [
        {
          type: 'paragraph',
          children: [
            { text: 'Hello ' },
            {
              type: 'link',
              url: 'https://test.com/',
              children: [{ text: 'World' }],
            },
            { text: '' },
          ],
        },
      ],
      {
        kind: 'text',
        anchor: { path: [0, 1, 0], offset: 0 },
        focus: { path: [0, 1, 0], offset: 'Wor'.length },
      },
      undefined,
      [clipboardRichSchema]
    );
    const clipboard = new FakeDataTransfer();

    clipboard.setData('text/html', '<strong>replaced</strong>');
    clipboard.setData('text/plain', 'replaced');

    editor.update(() => {
      editor.api.dom.clipboard.insertData(clipboard);
    });

    expect(editorGetSnapshot(editor).children).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'Hello replaced' },
          {
            type: 'link',
            url: 'https://test.com/',
            children: [{ text: 'ld' }],
          },
          { text: '' },
        ],
      },
    ]);
    expect(editorGetSnapshot(editor).selection).toEqual({
      kind: 'text',
      anchor: { path: [0, 0], offset: 'Hello replaced'.length },
      focus: { path: [0, 0], offset: 'Hello replaced'.length },
    });
  });

  it('pastes multiline plain text as separate blocks at a collapsed text selection', () => {
    const editor = createClipboardEditor(
      [
        {
          type: 'heading',
          children: [{ text: 'Hello ' }],
        },
      ],
      {
        kind: 'text',
        anchor: { path: [0, 0], offset: 'Hello '.length },
        focus: { path: [0, 0], offset: 'Hello '.length },
      }
    );
    const clipboard = new FakeDataTransfer();

    clipboard.setData('text/plain', 'world\nAnd text below');

    editor.update(() => {
      editor.api.dom.clipboard.insertData(clipboard);
    });

    expect(editorGetSnapshot(editor).children).toEqual([
      {
        type: 'heading',
        children: [{ text: 'Hello world' }],
      },
      {
        type: 'heading',
        children: [{ text: 'And text below' }],
      },
    ]);
    expect(editorGetSnapshot(editor).selection).toEqual({
      kind: 'text',
      anchor: { path: [1, 0], offset: 'And text below'.length },
      focus: { path: [1, 0], offset: 'And text below'.length },
    });
  });

  it('preserves tabs while splitting multiline plain-text fallback into blocks', () => {
    const editor = createClipboardEditor(
      [
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ],
      {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
      undefined
    );
    const clipboard = new FakeDataTransfer();

    clipboard.setData('text/plain', 'hello\tworld\nhello\tworld');

    editor.update(() => {
      editor.api.dom.clipboard.insertData(clipboard);
    });

    expect(editorGetSnapshot(editor).children).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'hello\tworld' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'hello\tworld' }],
      },
    ]);
    expect(editorGetSnapshot(editor).selection).toEqual({
      kind: 'text',
      anchor: { path: [1, 0], offset: 'hello\tworld'.length },
      focus: { path: [1, 0], offset: 'hello\tworld'.length },
    });
  });

  it('keeps a single pasted tab inside one text node through follow-up editing', () => {
    const editor = createClipboardEditor(
      [
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ],
      {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
      undefined
    );
    const clipboard = new FakeDataTransfer();

    clipboard.setData('text/plain', 'ABD\tEFG');

    editor.update(() => {
      editor.api.dom.clipboard.insertData(clipboard);
    });

    expect(editorGetSnapshot(editor).children).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'ABD\tEFG' }],
      },
    ]);

    editorReplace(editor, {
      children: editorGetSnapshot(editor).children,
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      },
    });

    editor.update((tx) => {
      tx.text.insert('C');
      tx.text.deleteForward({ unit: 'word' });
    });

    expect(editorGetSnapshot(editor).children).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'ABC\tEFG' }],
      },
    ]);
    expect(editorGetSnapshot(editor).selection).toEqual({
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
  });

  it('falls back to plain text when the custom MIME fragment is malformed', () => {
    withDom((document) => {
      const editor = createClipboardEditor(createChildren(), {
        kind: 'text',
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 4 },
      });
      const clipboard = new FakeDataTransfer();

      mountEditorRoot(editor, document);
      clipboard.setData('application/x-plite-fragment', 'not-valid-base64');
      clipboard.setData('text/plain', 'fallback');

      expect(() => {
        editor.update(() => {
          editor.api.dom.clipboard.insertData(clipboard);
        });
      }).not.toThrow();

      expect(editorGetSnapshot(editor).children[1].children[0]).toEqual({
        text: 'fallback',
      });
    });
  });

  it('falls back to plain text when the embedded HTML fragment is only text', () => {
    withDom((document) => {
      const editor = createClipboardEditor(createChildren(), {
        kind: 'text',
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 4 },
      });
      const clipboard = new FakeDataTransfer();

      mountEditorRoot(editor, document);
      clipboard.setData(
        'text/html',
        '<p>literal data-plite-fragment="not-valid-base64"</p>'
      );
      clipboard.setData('text/plain', 'fallback');

      expect(() => {
        editor.update(() => {
          editor.api.dom.clipboard.insertData(clipboard);
        });
      }).not.toThrow();

      expect(editorGetSnapshot(editor).children[1].children[0]).toEqual({
        text: 'fallback',
      });
    });
  });

  it('rejects malformed and non-v1 fragment envelopes', () => {
    withDom((document) => {
      const slice = ContentSlice.closed([
        { children: [{ text: 'exact' }], type: 'paragraph' },
      ]);
      const cases = [
        encodeRawFragmentPayload(document, '%E0%A4%A'),
        encodeFragmentPayload(document, 'not json'),
        encodeFragmentPayload(document, JSON.stringify({ text: 'oops' })),
        encodeFragmentPayload(document, JSON.stringify({ slice })),
        encodeFragmentPayload(document, JSON.stringify({ slice, version: 2 })),
        encodeFragmentPayload(
          document,
          JSON.stringify({ extra: true, slice, version: 1 })
        ),
      ];

      cases.forEach((payload, index) => {
        const editor = createClipboardEditor(createChildren(), {
          kind: 'text',
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 4 },
        });
        const clipboard = new FakeDataTransfer();

        mountEditorRoot(editor, document);
        clipboard.setData('application/x-plite-fragment', payload);
        clipboard.setData('text/plain', `fallback ${index}`);

        expect(() => {
          editor.update(() => {
            editor.api.dom.clipboard.insertData(clipboard);
          });
        }).not.toThrow();

        expect(editorGetSnapshot(editor).children[1].children[0]).toEqual({
          text: `fallback ${index}`,
        });
      });
    });
  });

  it('ignores malformed fragment payloads when there is no fallback data', () => {
    withDom((document) => {
      const editor = createClipboardEditor(createChildren(), {
        kind: 'text',
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 4 },
      });
      const before = editorGetSnapshot(editor);
      const clipboard = new FakeDataTransfer();

      mountEditorRoot(editor, document);
      clipboard.setData('application/x-plite-fragment', 'not-valid-base64');

      expect(() => {
        editor.update(() => {
          editor.api.dom.clipboard.insertData(clipboard);
        });
      }).not.toThrow();

      expect(editorGetSnapshot(editor)).toEqual(before);
    });
  });

  it('exports decorated multi-leaf text without leaking render-only wrappers', () => {
    withDom((document) => {
      const selection: Range = {
        kind: 'text',
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 4 },
      };

      const source = createClipboardEditor(
        [
          {
            type: 'paragraph',
            children: [{ text: 'alph beta' }],
          },
        ],
        selection
      );
      const clipboard = new FakeDataTransfer();

      mountDecoratedEditorDOM(source, document);

      source.api.dom.clipboard.writeSelection(clipboard);

      expect(clipboard.getData('application/x-plite-fragment')).not.toBe('');
      expect(clipboard.getData('text/plain')).toBe('lph');
      expect(clipboard.getData('text/html')).toContain('data-plite-fragment=');
      expect(clipboard.getData('text/html')).not.toContain('data-tone=');
    });
  });

  it('exports a selected inline void as a Plite fragment without requiring block void spacer DOM', () => {
    withDom((document) => {
      const source = createClipboardEditor(
        [
          {
            type: 'paragraph',
            children: [
              { text: 'alpha ' },
              {
                type: 'mention',
                character: 'R2-D2',
                children: [{ text: '' }],
              },
              { text: ' omega' },
            ],
          },
        ],
        {
          kind: 'text',
          anchor: { path: [0, 1, 0], offset: 0 },
          focus: { path: [0, 1, 0], offset: 0 },
        },
        undefined,
        [clipboardRichSchema]
      );
      const clipboard = new FakeDataTransfer();
      const innerTarget14 = createClipboardEditor(
        [
          {
            type: 'paragraph',
            children: [{ text: 'into target' }],
          },
        ],
        {
          kind: 'text',
          anchor: { path: [0, 0], offset: 4 },
          focus: { path: [0, 0], offset: 4 },
        },
        undefined,
        [clipboardRichSchema]
      );

      mountInlineVoidEditorDOM(source, document);
      mountEditorRoot(innerTarget14, document);

      expect(() => {
        source.api.dom.clipboard.writeSelection(clipboard);
      }).not.toThrow();

      const encoded = clipboard.getData('application/x-plite-fragment');

      expect(encoded).not.toBe('');
      expect(decodeFragmentPayload(document, encoded)).toEqual({
        slice: ContentSlice.fromJSON({
          content: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'mention',
                  character: 'R2-D2',
                  children: [{ text: '' }],
                },
              ],
            },
          ],
          openEnd: 1,
          openStart: 1,
        }),
        version: 1,
      });
      expect(clipboard.getData('text/html')).toContain('data-plite-fragment=');
      expect(clipboard.getData('text/plain')).not.toContain('\uFEFF');
      expect(clipboard.getData('text/plain')).not.toContain('alpha');
      expect(clipboard.getData('text/plain')).not.toContain('omega');

      innerTarget14.update(() => {
        innerTarget14.api.dom.clipboard.insertData(clipboard);
      });

      expect(editorGetSnapshot(innerTarget14).children).toEqual([
        {
          type: 'paragraph',
          children: [
            { text: 'into' },
            {
              type: 'mention',
              character: 'R2-D2',
              children: [{ text: '' }],
            },
            { text: ' target' },
          ],
        },
      ]);
      expect(editorGetSnapshot(innerTarget14).selection).toEqual({
        kind: 'text',
        anchor: { path: [0, 2], offset: 0 },
        focus: { path: [0, 2], offset: 0 },
      });
      expect(editorGetChangedRoots(innerTarget14)).toEqual([null]);

      innerTarget14.update(() => {
        innerTarget14.api.dom.clipboard.insertData(clipboard);
      });

      expect(editorGetSnapshot(innerTarget14).children).toEqual([
        {
          type: 'paragraph',
          children: [
            { text: 'into' },
            {
              type: 'mention',
              character: 'R2-D2',
              children: [{ text: '' }],
            },
            { text: '' },
            {
              type: 'mention',
              character: 'R2-D2',
              children: [{ text: '' }],
            },
            { text: ' target' },
          ],
        },
      ]);
      expect(editorGetSnapshot(innerTarget14).selection).toEqual({
        kind: 'text',
        anchor: { path: [0, 4], offset: 0 },
        focus: { path: [0, 4], offset: 0 },
      });
      expect(editorGetChangedRoots(innerTarget14)).toEqual([null]);

      source.update((tx) => {
        tx.text.delete();
      });

      expect(editorGetSnapshot(source).children).toEqual([
        {
          type: 'paragraph',
          children: [{ text: 'alpha  omega' }],
        },
      ]);
      expect(editorGetSnapshot(source).selection).toEqual({
        kind: 'text',
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      });
    });
  });

  it('exports visible block void content for external HTML clipboard targets', () => {
    withDom((document) => {
      const source = createClipboardEditor(
        [
          {
            type: 'paragraph',
            children: [{ text: 'before' }],
          },
          {
            type: 'image',
            url: 'https://example.com/image.png',
            children: [{ text: '' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'after' }],
          },
        ],
        {
          kind: 'text',
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 0 },
        },
        undefined,
        [clipboardRichSchema]
      );
      const clipboard = new FakeDataTransfer();

      mountBlockVoidEditorDOM(source, document);

      source.api.dom.clipboard.writeSelection(clipboard);

      const encoded = clipboard.getData('application/x-plite-fragment');
      const html = clipboard.getData('text/html');

      expect(encoded).not.toBe('');
      expect(decodeFragmentPayload(document, encoded)).toEqual({
        slice: ContentSlice.closed([
          {
            type: 'image',
            url: 'https://example.com/image.png',
            children: [{ text: '' }],
          },
        ]),
        version: 1,
      });
      expect(html).toContain('data-plite-fragment=');
      expect(html).toContain('<img');
      expect(html).toContain('https://example.com/image.png');
      expect(clipboard.getData('text/plain')).not.toContain('\uFEFF');
    });
  });

  it('attaches fragment metadata to cloned DOM when the selection ends in a block void', () => {
    withDom((document) => {
      const source = createClipboardEditor(
        [
          {
            type: 'paragraph',
            children: [{ text: 'before' }],
          },
          {
            type: 'image',
            url: 'https://example.com/image.png',
            children: [{ text: '' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'after' }],
          },
        ],
        {
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [1, 0], offset: 0 },
        },
        undefined,
        [clipboardRichSchema]
      );
      const clipboard = new FakeDataTransfer();

      mountBlockVoidEditorDOM(source, document);

      source.api.dom.clipboard.writeSelection(clipboard);

      expect(clipboard.getData('application/x-plite-fragment')).not.toBe('');
      expect(clipboard.getData('text/html')).toContain('data-plite-fragment=');
      expect(clipboard.getData('text/html')).toContain('<img');
    });
  });

  it('preserves the target block type for multiline plain-text fallback', () => {
    const editor = createClipboardEditor(
      [
        {
          type: 'heading',
          children: [{ text: 'hello' }],
        },
      ],
      {
        kind: 'text',
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      },
      undefined
    );
    const clipboard = new FakeDataTransfer();

    clipboard.setData('text/plain', 'A\nB');

    editor.update(() => {
      editor.api.dom.clipboard.insertData(clipboard);
    });

    expect(editorGetSnapshot(editor).children).toEqual([
      {
        type: 'heading',
        children: [{ text: 'heA' }],
      },
      {
        type: 'heading',
        children: [{ text: 'Bllo' }],
      },
    ]);
  });

  it('uses one logical edit for multiline plain-text fallback inside a populated block', () => {
    const editor = createClipboardEditor(
      [
        {
          type: 'paragraph',
          children: [{ text: 'alpha' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'beta' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'omega' }],
        },
      ],
      {
        kind: 'text',
        anchor: { path: [1, 0], offset: 2 },
        focus: { path: [1, 0], offset: 2 },
      },
      undefined
    );
    const clipboard = new FakeDataTransfer();

    clipboard.setData('text/plain', 'one\ntwo\nthree');

    editor.update(() => {
      editor.api.dom.clipboard.insertData(clipboard);
    });

    expect(editorGetSnapshot(editor).children).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'beone' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'two' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'threeta' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'omega' }],
      },
    ]);
    expect(editorGetSnapshot(editor).selection).toEqual({
      kind: 'text',
      anchor: { path: [3, 0], offset: 'three'.length },
      focus: { path: [3, 0], offset: 'three'.length },
    });
    expect(editorGetChangedRoots(editor)).toEqual([null]);
  });

  it('replaces an expanded selection with every line from multiline plain-text fallback', () => {
    const editor = createClipboardEditor(
      [
        {
          type: 'paragraph',
          children: [{ text: 'replace me' }],
        },
      ],
      {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 'replace me'.length },
      },
      undefined
    );
    const clipboard = new FakeDataTransfer();

    clipboard.setData('text/plain', 'paste one\npaste two');

    editor.update(() => {
      editor.api.dom.clipboard.insertData(clipboard);
    });

    expect(editorGetSnapshot(editor).children).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'paste one' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'paste two' }],
      },
    ]);
  });

  it('uses one logical edit for multiline plain-text fallback into an empty block', () => {
    const editor = createClipboardEditor(
      [
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ],
      {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
      undefined
    );
    const clipboard = new FakeDataTransfer();

    clipboard.setData('text/plain', 'one\ntwo\nthree');

    editor.update(() => {
      editor.api.dom.clipboard.insertData(clipboard);
    });

    expect(editorGetSnapshot(editor).children).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'one' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'two' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'three' }],
      },
    ]);
    expect(editorGetSnapshot(editor).selection).toEqual({
      kind: 'text',
      anchor: { path: [2, 0], offset: 'three'.length },
      focus: { path: [2, 0], offset: 'three'.length },
    });
    expect(editorGetChangedRoots(editor)).toEqual([null]);
  });

  it('records multiline plain-text fallback as one undoable history batch', () => {
    const editor = createEditor({ extensions: [history(), dom()] });
    const clipboard = new FakeDataTransfer();
    let commits = 0;

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    clipboard.setData('text/plain', 'one\ntwo\nthree');
    editor.subscribeCommit(() => (commits += 1) - 1);

    editor.update(() => {
      editor.api.dom.clipboard.insertData(clipboard as unknown as DataTransfer);
    });

    expect(commits).toBe(1);
    expect(getHistory(editor).undos).toHaveLength(1);
    expect(getHistory(editor).undos[0]?.change.empty).toBe(false);

    undo(editor);

    expect(editorGetSnapshot(editor).children).toEqual([
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ]);
    expect(editorGetSnapshot(editor).selection).toEqual({
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });
});
