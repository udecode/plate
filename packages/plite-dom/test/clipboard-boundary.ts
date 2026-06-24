import { JSDOM } from 'jsdom';
import {
  createEditor,
  type Descendant,
  defineEditorExtension,
  type Node,
  type Range,
  ElementApi as PliteElement,
} from '@platejs/plite';
import {
  addMark as editorAddMark,
  getOperations as editorGetOperations,
  getRuntimeId as editorGetRuntimeId,
  getSnapshot as editorGetSnapshot,
  replace as editorReplace,
  string as editorString,
} from '@platejs/plite/internal';
import { history } from '@platejs/plite-history';

import { dom } from '../src/index';
import {
  DOMCoverage,
  EDITOR_TO_ELEMENT,
  EDITOR_TO_KEY_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
} from '../src/internal';

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

const getHistory = (editor: Editor) =>
  editor.read((state: any) => state.history.get());

const undo = (editor: Editor) => {
  editor.update((tx) => {
    tx.history.undo();
  });
};

const seedNodeMaps = (editor: Editor, children: Descendant[]) => {
  const visit = (parent: Editor | PliteElement, child: Node, index: number) => {
    NODE_TO_PARENT.set(child, parent);
    NODE_TO_INDEX.set(child, index);

    if (PliteElement.isElement(child)) {
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
  configureEditor?: (editor: Editor) => void
) => {
  const editor = createEditor({
    extensions: [dom(clipboardFormatKey ? { clipboardFormatKey } : {})],
  });

  configureEditor?.(editor);

  editorReplace(editor, {
    children,
    selection,
  });

  seedNodeMaps(
    editor,
    editor.read((state) => state.runtime.snapshot().children)
  );

  return editor;
};

const withDom = (run: (document: Document) => void) => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');

  try {
    run(dom.window.document);
  } finally {
    dom.window.close();
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
    const textNode = document.createTextNode(
      (block as PliteElement).children[0].text as string
    );

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

  for (const [itemIndex, item] of (
    editor.read((state) => state.runtime.snapshot().children[0]) as PliteElement
  ).children.entries()) {
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

const getRuntimeId = (editor: Editor, path: number[]) => {
  const runtimeId = editorGetRuntimeId(editor, path);

  if (!runtimeId) {
    throw new Error(`Missing runtime id at ${path.join('.')}`);
  }

  return runtimeId;
};

describe('plite-dom clipboard boundary', () => {
  it('installs DOM host capabilities on the editor instance', () => {
    const editor = createEditor({ extensions: [dom()] });
    const headlessEditor = createEditor();

    expect('dom' in headlessEditor).toBe(false);
    expect(typeof editor.api.clipboard.insertData).toBe('function');
    expect(typeof editor.api.clipboard.writeSelection).toBe('function');
    expect('clipboard' in editor).toBe(false);
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
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
      undefined,
      (target) => {
        target.extend(
          defineEditorExtension({
            name: 'product-card-paste',
            clipboard: {
              insertData(data, { editor, next, state }) {
                const title = data.getData('application/x-product-card-title');

                seen.push(
                  `${title ? 'consume' : 'delegate'}:${
                    state.selection.get()?.anchor.offset ?? -1
                  }`
                );

                if (!title) {
                  return next();
                }

                editor.update((tx) => {
                  tx.text.insert(`Card: ${title}`);
                });
                return true;
              },
            },
          })
        );
      }
    );
    const productCard = new FakeDataTransfer();
    const plainText = new FakeDataTransfer();

    productCard.setData('application/x-product-card-title', 'Ada');
    productCard.setData('text/plain', 'fallback');
    plainText.setData('text/plain', '!');

    editor.update(() => {
      expect(
        editor.api.clipboard.insertData(productCard as unknown as DataTransfer)
      ).toBe(true);
    });
    editor.update(() => {
      expect(
        editor.api.clipboard.insertData(plainText as unknown as DataTransfer)
      ).toBe(true);
    });

    expect(editorString(editor, [0])).toBe('Card: Ada!beta');
    expect(seen).toEqual(['consume:0', 'delegate:9']);
  });

  it('round-trips a selected fragment through clipboard payloads and replaces the target selection', () => {
    withDom((document) => {
      const copySelection: Range = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      const replaceSelection: Range = {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 4 },
      };

      const source = createClipboardEditor(createChildren(), copySelection);
      const target = createClipboardEditor(createChildren(), replaceSelection);
      const clipboard = new FakeDataTransfer();

      mountSimpleEditorDOM(source, document);
      mountEditorRoot(target, document);

      source.api.clipboard.writeSelection(clipboard as unknown as DataTransfer);

      expect(clipboard.getData('application/x-plite-fragment')).not.toBe('');
      expect(clipboard.getData('text/html')).toContain('data-plite-fragment=');
      expect(clipboard.getData('text/plain')).toBe('alpha');

      target.update(() => {
        target.api.clipboard.insertData(clipboard as unknown as DataTransfer);
      });

      expect(editorGetSnapshot(target).children).toEqual([
        {
          type: 'paragraph',
          children: [{ text: 'alpha' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'alpha' }],
        },
      ]);
      expect(editorGetSnapshot(target).selection).toEqual({
        anchor: { path: [1, 0], offset: 5 },
        focus: { path: [1, 0], offset: 5 },
      });
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
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [2, 0], offset: 1 },
        }
      );
      const clipboard = new FakeDataTransfer();

      mountSimpleEditorDOM(source, document);

      source.api.clipboard.writeSelection(clipboard as unknown as DataTransfer);

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
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [3, 0], offset: 'Line 4'.length },
        }
      );
      const clipboard = new FakeDataTransfer();

      mountSimpleEditorDOM(source, document);

      source.api.clipboard.writeSelection(clipboard as unknown as DataTransfer);

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
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 1, 0], offset: 'two'.length },
      });
      const clipboard = new FakeDataTransfer();

      mountListEditorDOM(source, document);

      expect(() => {
        source.api.clipboard.writeSelection(
          clipboard as unknown as DataTransfer
        );
      }).not.toThrow();

      const encoded = clipboard.getData('application/x-plite-fragment');

      expect(encoded).not.toBe('');
      expect(decodeFragmentPayload(document, encoded)).toEqual(children);
      expect(clipboard.getData('text/html')).toContain('data-plite-fragment=');
      expect(clipboard.getData('text/plain')).toContain('one');
      expect(clipboard.getData('text/plain')).toContain('two');
    });
  });

  it('does not emit hidden model fragments for summary coverage copy policy', () => {
    withDom((document) => {
      const source = createClipboardEditor(createChildren(), {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      });
      const clipboard = new FakeDataTransfer();

      mountSimpleEditorDOM(source, document);
      DOMCoverage.registerBoundary(source, {
        boundaryId: 'summary-alpha',
        anchor: { type: 'placeholder', runtimeId: getRuntimeId(source, [0]) },
        copyPolicy: 'summary',
        coveredPathRanges: [{ anchor: [0, 0], focus: [0, 0] }],
        coveredRuntimeRanges: [],
        findPolicy: 'native',
        ownerPath: [0],
        ownerRuntimeId: getRuntimeId(source, [0]),
        reason: 'app-collapse',
        selectionPolicy: 'skip',
        state: 'intentionally-hidden',
        version: 1,
      });

      source.api.clipboard.writeSelection(clipboard as unknown as DataTransfer);

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
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      const replaceSelection: Range = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      };

      const source = createClipboardEditor(createChildren(), copySelection);
      const target = createClipboardEditor(
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
      mountEditorRoot(target, document);

      source.api.clipboard.writeSelection(clipboard as unknown as DataTransfer);

      target.update(() => {
        target.api.clipboard.insertData(clipboard as unknown as DataTransfer);
      });

      expect(editorGetSnapshot(target).children).toEqual([
        {
          type: 'heading',
          children: [{ text: 'alpha' }],
        },
      ]);
      expect(editorGetSnapshot(target).selection).toEqual({
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 },
      });
    });
  });

  it('preserves block separation when a rich multi-block fragment is pasted in the middle of a text block', () => {
    withDom((document) => {
      const copySelection: Range = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 'two'.length },
      };
      const targetSelection: Range = {
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
      const target = createClipboardEditor(
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
      mountEditorRoot(target, document);

      source.api.clipboard.writeSelection(clipboard as unknown as DataTransfer);

      expect(clipboard.getData('application/x-plite-fragment')).not.toBe('');
      expect(clipboard.getData('text/html')).toContain('data-plite-fragment=');
      expect(clipboard.getData('text/plain').trimEnd()).toBe('one\ntwo');

      const operationsBefore = editorGetOperations(target).length;

      target.update(() => {
        target.api.clipboard.insertData(clipboard as unknown as DataTransfer);
      });

      expect(editorGetSnapshot(target).children).toEqual([
        {
          type: 'paragraph',
          children: [{ text: 'before one' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'twoafter' }],
        },
      ]);
      expect(editorGetSnapshot(target).selection).toEqual({
        anchor: { path: [1, 0], offset: 'two'.length },
        focus: { path: [1, 0], offset: 'two'.length },
      });
      expect(editorGetOperations(target).length - operationsBefore).toBe(1);
    });
  });

  it('preserves the target empty text block for the first pasted text block and promotes the tail', () => {
    withDom((document) => {
      const copySelection: Range = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 'Some text'.length },
      };
      const targetSelection: Range = {
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
      const target = createClipboardEditor(
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
      mountEditorRoot(target, document);

      source.api.clipboard.writeSelection(clipboard as unknown as DataTransfer);

      const operationsBefore = editorGetOperations(target).length;

      target.update(() => {
        target.api.clipboard.insertData(clipboard as unknown as DataTransfer);
      });

      expect(editorGetSnapshot(target).children).toEqual([
        {
          type: 'block-quote',
          children: [{ text: 'Hello world' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'Some text' }],
        },
      ]);
      expect(editorGetSnapshot(target).selection).toEqual({
        anchor: { path: [1, 0], offset: 'Some text'.length },
        focus: { path: [1, 0], offset: 'Some text'.length },
      });
      expect(editorGetOperations(target).length - operationsBefore).toBe(1);
    });
  });

  it('does not add empty text leaves when pasting a full multi-block fragment', () => {
    withDom((document) => {
      const copySelection: Range = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 'second block'.length },
      };
      const targetSelection: Range = {
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
      const target = createClipboardEditor(
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
      mountEditorRoot(target, document);

      source.api.clipboard.writeSelection(clipboard as unknown as DataTransfer);

      target.update(() => {
        target.api.clipboard.insertData(clipboard as unknown as DataTransfer);
      });

      expect(editorGetSnapshot(target).children).toEqual([
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
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 'replacement'.length },
      };
      const targetSelection: Range = {
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
      const target = createClipboardEditor(
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
      mountEditorRoot(target, document);

      source.api.clipboard.writeSelection(clipboard as unknown as DataTransfer);

      target.update(() => {
        target.api.clipboard.insertData(clipboard as unknown as DataTransfer);
      });

      expect(editorGetSnapshot(target).children).toEqual([
        {
          type: 'paragraph',
          children: [{ text: 'replacement' }],
        },
      ]);
      expect(editorGetSnapshot(target).selection).toEqual({
        anchor: { path: [0, 0], offset: 'replacement'.length },
        focus: { path: [0, 0], offset: 'replacement'.length },
      });
    });
  });

  it('replaces selected content that starts with an empty block with multiple pasted blocks', () => {
    withDom((document) => {
      const copySelection: Range = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 'second replacement'.length },
      };
      const targetSelection: Range = {
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
      const target = createClipboardEditor(
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
      mountEditorRoot(target, document);

      source.api.clipboard.writeSelection(clipboard as unknown as DataTransfer);

      target.update(() => {
        target.api.clipboard.insertData(clipboard as unknown as DataTransfer);
      });

      expect(editorGetSnapshot(target).children).toEqual([
        {
          type: 'paragraph',
          children: [{ text: 'first replacement' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'second replacement' }],
        },
      ]);
      expect(editorGetSnapshot(target).selection).toEqual({
        anchor: { path: [1, 0], offset: 'second replacement'.length },
        focus: { path: [1, 0], offset: 'second replacement'.length },
      });
    });
  });

  it('supports a custom fragment MIME key', () => {
    withDom((document) => {
      const selection: Range = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      const replaceSelection: Range = {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 4 },
      };

      const source = createClipboardEditor(
        createChildren(),
        selection,
        'x-proof-fragment'
      );
      const target = createClipboardEditor(
        createChildren(),
        replaceSelection,
        'x-proof-fragment'
      );
      const clipboard = new FakeDataTransfer();

      mountSimpleEditorDOM(source, document);
      mountEditorRoot(target, document);

      source.api.clipboard.writeSelection(clipboard as unknown as DataTransfer);

      expect(clipboard.getData('application/x-plite-fragment')).toBe('');
      expect(clipboard.getData('application/x-proof-fragment')).not.toBe('');

      target.update(() => {
        target.api.clipboard.insertData(clipboard as unknown as DataTransfer);
      });

      expect(
        (editorGetSnapshot(target).children[1] as PliteElement).children[0]
      ).toEqual({ text: 'alpha' });
    });
  });

  it('falls back to the HTML embedded fragment when the custom MIME payload is absent', () => {
    withDom((document) => {
      const selection: Range = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      const replaceSelection: Range = {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 4 },
      };

      const source = createClipboardEditor(createChildren(), selection);
      const target = createClipboardEditor(createChildren(), replaceSelection);
      const encodedClipboard = new FakeDataTransfer();
      const clipboard = new FakeDataTransfer();

      mountSimpleEditorDOM(source, document);
      mountEditorRoot(target, document);

      source.api.clipboard.writeSelection(
        encodedClipboard as unknown as DataTransfer
      );
      clipboard.setData('text/html', encodedClipboard.getData('text/html'));

      target.update(() => {
        target.api.clipboard.insertData(clipboard as unknown as DataTransfer);
      });

      expect(
        (editorGetSnapshot(target).children[1] as PliteElement).children[0]
      ).toEqual({ text: 'alpha' });
    });
  });

  it('accepts custom-key embedded HTML fragments in matching custom-key editors', () => {
    withDom((document) => {
      const selection: Range = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      const replaceSelection: Range = {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 4 },
      };

      const source = createClipboardEditor(
        createChildren(),
        selection,
        'x-proof-fragment'
      );
      const target = createClipboardEditor(
        createChildren(),
        replaceSelection,
        'x-proof-fragment'
      );
      const encodedClipboard = new FakeDataTransfer();
      const clipboard = new FakeDataTransfer();

      mountSimpleEditorDOM(source, document);
      mountEditorRoot(target, document);

      source.api.clipboard.writeSelection(
        encodedClipboard as unknown as DataTransfer
      );
      clipboard.setData('text/html', encodedClipboard.getData('text/html'));
      clipboard.setData('text/plain', 'plain fallback');

      target.update(() => {
        target.api.clipboard.insertData(clipboard as unknown as DataTransfer);
      });

      expect(
        (editorGetSnapshot(target).children[1] as PliteElement).children[0]
      ).toEqual({ text: 'alpha' });
    });
  });

  it('rejects custom-key embedded HTML fragments in default-key editors', () => {
    withDom((document) => {
      const selection: Range = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      const replaceSelection: Range = {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 4 },
      };

      const source = createClipboardEditor(
        createChildren(),
        selection,
        'x-proof-fragment'
      );
      const target = createClipboardEditor(createChildren(), replaceSelection);
      const encodedClipboard = new FakeDataTransfer();
      const clipboard = new FakeDataTransfer();

      mountSimpleEditorDOM(source, document);
      mountEditorRoot(target, document);

      source.api.clipboard.writeSelection(
        encodedClipboard as unknown as DataTransfer
      );
      clipboard.setData('text/html', encodedClipboard.getData('text/html'));
      clipboard.setData('text/plain', 'plain fallback');

      target.update(() => {
        target.api.clipboard.insertData(clipboard as unknown as DataTransfer);
      });

      expect(
        (editorGetSnapshot(target).children[1] as PliteElement).children[0]
      ).toEqual({ text: 'plain fallback' });
    });
  });

  it('falls back to plain text when no fragment payload exists', () => {
    const editor = createClipboardEditor(
      createChildren(),
      {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 4 },
      },
      undefined
    );
    const clipboard = new FakeDataTransfer();

    clipboard.setData('text/plain', 'hello');

    editor.update(() => {
      editor.api.clipboard.insertData(clipboard as unknown as DataTransfer);
    });

    expect(
      (editorGetSnapshot(editor).children[1] as PliteElement).children[0]
    ).toEqual({ text: 'hello' });
  });

  it('applies collapsed active marks to plain text fallback', () => {
    const editor = createClipboardEditor(createChildren(), {
      anchor: { path: [1, 0], offset: 4 },
      focus: { path: [1, 0], offset: 4 },
    });
    const clipboard = new FakeDataTransfer();

    editorAddMark(editor, 'bold', true);
    clipboard.setData('text/plain', 'hello');

    editor.update(() => {
      editor.api.clipboard.insertData(clipboard as unknown as DataTransfer);
    });

    expect(
      (editorGetSnapshot(editor).children[1] as PliteElement).children
    ).toEqual([{ text: 'beta' }, { bold: true, text: 'hello' }]);
    expect(editorGetSnapshot(editor).selection).toEqual({
      anchor: { path: [1, 1], offset: 'hello'.length },
      focus: { path: [1, 1], offset: 'hello'.length },
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
        anchor: { path: [0, 0], offset: 'Hello '.length },
        focus: { path: [0, 0], offset: 'Hello '.length },
      }
    );
    const clipboard = new FakeDataTransfer();

    editorAddMark(editor, 'bold', true);
    clipboard.setData('text/plain', 'world\nNext');

    editor.update(() => {
      editor.api.clipboard.insertData(clipboard as unknown as DataTransfer);
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
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      }
    );
    const clipboard = new FakeDataTransfer();

    editorAddMark(editor, 'bold', true);
    clipboard.setData('text/plain', 'One\nTwo');

    editor.update(() => {
      editor.api.clipboard.insertData(clipboard as unknown as DataTransfer);
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
        anchor: { path: [0, 1, 0], offset: 0 },
        focus: { path: [0, 1, 0], offset: 'Wor'.length },
      },
      undefined,
      (editor) => {
        editor.extend({
          elements: [{ inline: true, type: 'link' }],
          name: 'inline-text-paste',
        });
      }
    );
    const clipboard = new FakeDataTransfer();

    clipboard.setData('text/html', '<strong>replaced</strong>');
    clipboard.setData('text/plain', 'replaced');

    editor.update(() => {
      editor.api.clipboard.insertData(clipboard as unknown as DataTransfer);
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
        anchor: { path: [0, 0], offset: 'Hello '.length },
        focus: { path: [0, 0], offset: 'Hello '.length },
      }
    );
    const clipboard = new FakeDataTransfer();

    clipboard.setData('text/plain', 'world\nAnd text below');

    editor.update(() => {
      editor.api.clipboard.insertData(clipboard as unknown as DataTransfer);
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
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
      undefined
    );
    const clipboard = new FakeDataTransfer();

    clipboard.setData('text/plain', 'hello\tworld\nhello\tworld');

    editor.update(() => {
      editor.api.clipboard.insertData(clipboard as unknown as DataTransfer);
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
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
      undefined
    );
    const clipboard = new FakeDataTransfer();

    clipboard.setData('text/plain', 'ABD\tEFG');

    editor.update(() => {
      editor.api.clipboard.insertData(clipboard as unknown as DataTransfer);
    });

    expect(editorGetSnapshot(editor).children).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'ABD\tEFG' }],
      },
    ]);

    editorReplace(editor, {
      children: editorGetSnapshot(editor).children,
      marks: null,
      selection: {
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
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
  });

  it('falls back to plain text when the custom MIME fragment is malformed', () => {
    withDom((document) => {
      const editor = createClipboardEditor(createChildren(), {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 4 },
      });
      const clipboard = new FakeDataTransfer();

      mountEditorRoot(editor, document);
      clipboard.setData('application/x-plite-fragment', 'not-valid-base64');
      clipboard.setData('text/plain', 'fallback');

      expect(() => {
        editor.update(() => {
          editor.api.clipboard.insertData(clipboard as unknown as DataTransfer);
        });
      }).not.toThrow();

      expect(
        (editorGetSnapshot(editor).children[1] as PliteElement).children[0]
      ).toEqual({ text: 'fallback' });
    });
  });

  it('falls back to plain text when the embedded HTML fragment is only text', () => {
    withDom((document) => {
      const editor = createClipboardEditor(createChildren(), {
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
          editor.api.clipboard.insertData(clipboard as unknown as DataTransfer);
        });
      }).not.toThrow();

      expect(
        (editorGetSnapshot(editor).children[1] as PliteElement).children[0]
      ).toEqual({ text: 'fallback' });
    });
  });

  it('rejects decoded fragment payloads that are not Plite fragment arrays', () => {
    withDom((document) => {
      const cases = [
        encodeRawFragmentPayload(document, '%E0%A4%A'),
        encodeFragmentPayload(document, 'not json'),
        encodeFragmentPayload(document, JSON.stringify({ text: 'oops' })),
      ];

      cases.forEach((payload, index) => {
        const editor = createClipboardEditor(createChildren(), {
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 4 },
        });
        const clipboard = new FakeDataTransfer();

        mountEditorRoot(editor, document);
        clipboard.setData('application/x-plite-fragment', payload);
        clipboard.setData('text/plain', `fallback ${index}`);

        expect(() => {
          editor.update(() => {
            editor.api.clipboard.insertData(
              clipboard as unknown as DataTransfer
            );
          });
        }).not.toThrow();

        expect(
          (editorGetSnapshot(editor).children[1] as PliteElement).children[0]
        ).toEqual({ text: `fallback ${index}` });
      });
    });
  });

  it('ignores malformed fragment payloads when there is no fallback data', () => {
    withDom((document) => {
      const editor = createClipboardEditor(createChildren(), {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 4 },
      });
      const before = editorGetSnapshot(editor);
      const clipboard = new FakeDataTransfer();

      mountEditorRoot(editor, document);
      clipboard.setData('application/x-plite-fragment', 'not-valid-base64');

      expect(() => {
        editor.update(() => {
          editor.api.clipboard.insertData(clipboard as unknown as DataTransfer);
        });
      }).not.toThrow();

      expect(editorGetSnapshot(editor)).toEqual(before);
    });
  });

  it('exports decorated multi-leaf text without leaking render-only wrappers', () => {
    withDom((document) => {
      const selection: Range = {
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

      source.api.clipboard.writeSelection(clipboard as unknown as DataTransfer);

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
          anchor: { path: [0, 1, 0], offset: 0 },
          focus: { path: [0, 1, 0], offset: 0 },
        },
        undefined,
        (editor) => {
          editor.extend({
            elements: [{ type: 'mention', void: 'markable-inline' }],
            name: 'inline-void-copy',
          });
        }
      );
      const clipboard = new FakeDataTransfer();
      const target = createClipboardEditor(
        [
          {
            type: 'paragraph',
            children: [{ text: 'into target' }],
          },
        ],
        {
          anchor: { path: [0, 0], offset: 4 },
          focus: { path: [0, 0], offset: 4 },
        },
        undefined,
        (editor) => {
          editor.extend({
            elements: [{ type: 'mention', void: 'markable-inline' }],
            name: 'inline-void-paste',
          });
        }
      );

      mountInlineVoidEditorDOM(source, document);
      mountEditorRoot(target, document);

      expect(() => {
        source.api.clipboard.writeSelection(
          clipboard as unknown as DataTransfer
        );
      }).not.toThrow();

      const encoded = clipboard.getData('application/x-plite-fragment');

      expect(encoded).not.toBe('');
      expect(decodeFragmentPayload(document, encoded)).toEqual([
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
      ]);
      expect(clipboard.getData('text/html')).toContain('data-plite-fragment=');
      expect(clipboard.getData('text/plain')).not.toContain('\uFEFF');
      expect(clipboard.getData('text/plain')).not.toContain('alpha');
      expect(clipboard.getData('text/plain')).not.toContain('omega');

      const operationsBefore = editorGetOperations(target).length;

      target.update(() => {
        target.api.clipboard.insertData(clipboard as unknown as DataTransfer);
      });

      expect(editorGetSnapshot(target).children).toEqual([
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
      expect(editorGetSnapshot(target).selection).toEqual({
        anchor: { path: [0, 2], offset: 0 },
        focus: { path: [0, 2], offset: 0 },
      });
      expect(editorGetOperations(target).length - operationsBefore).toBe(1);

      target.update(() => {
        target.api.clipboard.insertData(clipboard as unknown as DataTransfer);
      });

      expect(editorGetSnapshot(target).children).toEqual([
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
      expect(editorGetSnapshot(target).selection).toEqual({
        anchor: { path: [0, 4], offset: 0 },
        focus: { path: [0, 4], offset: 0 },
      });
      expect(editorGetOperations(target).length - operationsBefore).toBe(2);

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
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 0 },
        },
        undefined,
        (editor) => {
          editor.extend({
            elements: [{ type: 'image', void: 'block' }],
            name: 'block-void-copy',
          });
        }
      );
      const clipboard = new FakeDataTransfer();

      mountBlockVoidEditorDOM(source, document);

      source.api.clipboard.writeSelection(clipboard as unknown as DataTransfer);

      const encoded = clipboard.getData('application/x-plite-fragment');
      const html = clipboard.getData('text/html');

      expect(encoded).not.toBe('');
      expect(decodeFragmentPayload(document, encoded)).toEqual([
        {
          type: 'image',
          url: 'https://example.com/image.png',
          children: [{ text: '' }],
        },
      ]);
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
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [1, 0], offset: 0 },
        },
        undefined,
        (editor) => {
          editor.extend({
            elements: [{ type: 'image', void: 'block' }],
            name: 'block-void-end-copy',
          });
        }
      );
      const clipboard = new FakeDataTransfer();

      mountBlockVoidEditorDOM(source, document);

      source.api.clipboard.writeSelection(clipboard as unknown as DataTransfer);

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
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      },
      undefined
    );
    const clipboard = new FakeDataTransfer();

    clipboard.setData('text/plain', 'A\nB');

    editor.update(() => {
      editor.api.clipboard.insertData(clipboard as unknown as DataTransfer);
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
        anchor: { path: [1, 0], offset: 2 },
        focus: { path: [1, 0], offset: 2 },
      },
      undefined
    );
    const clipboard = new FakeDataTransfer();
    const operationsBefore = editorGetOperations(editor).length;

    clipboard.setData('text/plain', 'one\ntwo\nthree');

    editor.update(() => {
      editor.api.clipboard.insertData(clipboard as unknown as DataTransfer);
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
      anchor: { path: [3, 0], offset: 'three'.length },
      focus: { path: [3, 0], offset: 'three'.length },
    });
    expect(editorGetOperations(editor).length - operationsBefore).toBe(1);
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
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 'replace me'.length },
      },
      undefined
    );
    const clipboard = new FakeDataTransfer();

    clipboard.setData('text/plain', 'paste one\npaste two');

    editor.update(() => {
      editor.api.clipboard.insertData(clipboard as unknown as DataTransfer);
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
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
      undefined
    );
    const clipboard = new FakeDataTransfer();
    const operationsBefore = editorGetOperations(editor).length;

    clipboard.setData('text/plain', 'one\ntwo\nthree');

    editor.update(() => {
      editor.api.clipboard.insertData(clipboard as unknown as DataTransfer);
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
      anchor: { path: [2, 0], offset: 'three'.length },
      focus: { path: [2, 0], offset: 'three'.length },
    });
    expect(
      editorGetOperations(editor).length - operationsBefore
    ).toBeLessThanOrEqual(1);
  });

  it('records multiline plain-text fallback as one undoable history batch', () => {
    const editor = createEditor({ extensions: [history(), dom()] });
    const clipboard = new FakeDataTransfer();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ],
      marks: null,
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    clipboard.setData('text/plain', 'one\ntwo\nthree');

    editor.update(() => {
      editor.api.clipboard.insertData(clipboard as unknown as DataTransfer);
    });

    expect(getHistory(editor).undos).toHaveLength(1);
    expect(getHistory(editor).undos[0]?.operations).toHaveLength(1);

    undo(editor);

    expect(editorGetSnapshot(editor).children).toEqual([
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ]);
    expect(editorGetSnapshot(editor).selection).toEqual({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });
});
