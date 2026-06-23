import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Editor } from '@platejs/plite/internal';

import {
  createEditor,
  type Descendant,
  defineEditorExtension,
  type Element,
  NodeApi,
} from '../src';

const collapsedSelection = (path: number[], offset: number) => ({
  anchor: { path, offset },
  focus: { path, offset },
});

describe('plite transforms contract', () => {
  it('moveNodes is a no-op when the source and destination paths are equal', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        { type: 'block', children: [{ text: '1' }] },
        { type: 'block', children: [{ text: '2' }] },
      ],
      selection: null,
      marks: null,
    });

    editor.update((tx) => {
      tx.nodes.move({ at: [1], to: [1] });
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      { type: 'block', children: [{ text: '1' }] },
      { type: 'block', children: [{ text: '2' }] },
    ]);
  });

  it('moveNodes can move a top-level block inside the next block container', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'block',
          children: [{ text: 'one' }],
        },
        {
          type: 'block',
          children: [{ type: 'block', children: [{ text: 'two' }] }],
        },
      ],
      selection: collapsedSelection([0, 0], 0),
      marks: null,
    });

    editor.update((tx) => {
      tx.nodes.move({ at: [0], to: [1, 1] });
    });

    const after = Editor.getSnapshot(editor);

    assert.deepEqual(after.children, [
      {
        type: 'block',
        children: [
          { type: 'block', children: [{ text: 'two' }] },
          { type: 'block', children: [{ text: 'one' }] },
        ],
      },
    ]);
    assert.deepEqual(after.selection, collapsedSelection([0, 1, 0], 0));
  });

  it('insertText keeps the selected mark when replacing a marked leaf', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'This ' },
            { bold: true, text: 'bold' },
            { text: ' text' },
          ],
        },
      ],
      selection: {
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 1], offset: 4 },
      },
      marks: null,
    });

    editor.update((tx) => {
      tx.text.insert('plain');
    });

    const after = Editor.getSnapshot(editor);

    assert.deepEqual(after.children, [
      {
        type: 'paragraph',
        children: [
          { text: 'This ' },
          { bold: true, text: 'plain' },
          { text: ' text' },
        ],
      },
    ]);
    assert.deepEqual(after.selection, collapsedSelection([0, 1], 5));
  });

  it('insertText keeps selected marks when replacing the full document text', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ bold: true, text: 'Styled' }],
        },
      ],
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 'Styled'.length },
      },
      marks: null,
    });

    editor.update((tx) => {
      tx.text.insert('Next');
    });

    const after = Editor.getSnapshot(editor);

    assert.deepEqual(after.children, [
      {
        type: 'paragraph',
        children: [{ bold: true, text: 'Next' }],
      },
    ]);
    assert.deepEqual(after.selection, collapsedSelection([0, 0], 4));
  });

  it('insertText replaces a mixed-mark range without removing text before it', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { bold: true, text: 'This is a ' },
            { italic: true, text: 'test' },
            { bold: true, text: '.' },
          ],
        },
      ],
      selection: {
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 2], offset: 1 },
      },
      marks: null,
    });

    editor.update((tx) => {
      tx.text.insert('X');
    });

    const after = Editor.getSnapshot(editor);

    assert.deepEqual(after.children, [
      {
        type: 'paragraph',
        children: [{ bold: true, text: 'This is a X' }],
      },
    ]);
    assert.deepEqual(after.selection, collapsedSelection([0, 0], 11));
  });

  it('insertText replaces a selection spanning a block void without keeping a void anchor', () => {
    const editor = createEditor();
    editor.extend(
      defineEditorExtension({
        elements: [{ type: 'image', void: 'block' }],
        name: 'block-void-insert-selection-contract',
      })
    );

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Before' }],
        },
        {
          type: 'image',
          children: [{ text: '' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'After' }],
        },
      ] as Descendant[],
      selection: {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [2, 0], offset: 2 },
      },
      marks: null,
    });

    editor.update((tx) => {
      tx.text.insert('X');
    });

    const after = Editor.getSnapshot(editor);

    assert.deepEqual(after.children, [
      {
        type: 'paragraph',
        children: [{ text: 'BefXter' }],
      },
    ]);
    assert.deepEqual(after.selection, collapsedSelection([0, 0], 4));
  });

  it('mergeNodes does not cross an isolating block boundary', () => {
    const editor = createEditor();
    editor.extend(
      defineEditorExtension({
        elements: [{ isolating: true, type: 'callout' }],
        name: 'isolating-merge-boundary',
      })
    );

    Editor.replace(editor, {
      children: [
        {
          type: 'callout',
          children: [{ type: 'paragraph', children: [{ text: 'inside' }] }],
        },
        { type: 'paragraph', children: [{ text: 'after' }] },
      ] as Descendant[],
      selection: collapsedSelection([1, 0], 0),
      marks: null,
    });

    editor.update((tx) => {
      tx.nodes.merge({ at: [1] });
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        type: 'callout',
        children: [{ type: 'paragraph', children: [{ text: 'inside' }] }],
      },
      { type: 'paragraph', children: [{ text: 'after' }] },
    ]);
  });

  it('setNodes can target the selected inline element through match without an explicit path', () => {
    const editor = createEditor();
    editor.extend(
      defineEditorExtension({
        elements: [{ inline: true, type: 'inline' }],
        name: 'inline',
      })
    );

    Editor.replace(editor, {
      children: [
        {
          type: 'block',
          children: [
            { text: '' },
            { type: 'inline', children: [{ text: 'word' }] },
            { text: '' },
          ],
        } as Descendant,
      ],
      selection: collapsedSelection([0, 1, 0], 0),
      marks: null,
    });

    editor.update((tx) => {
      tx.nodes.set(
        { someKey: true },
        {
          match: (node) => 'children' in node && tx.schema.isInline(node),
        }
      );
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        type: 'block',
        children: [
          { text: '' },
          { type: 'inline', someKey: true, children: [{ text: 'word' }] },
          { text: '' },
        ],
      },
    ]);
  });

  it('setNodes accepts typed element props through the transaction API', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'one' }],
        } as Descendant,
      ],
      selection: collapsedSelection([0, 0], 0),
      marks: null,
    });

    editor.update((tx) => {
      tx.nodes.set<Element>({ type: 'heading-one' }, { at: [0] });
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        type: 'heading-one',
        children: [{ text: 'one' }],
      },
    ]);
  });

  it('setNodes preserves existing element attrs and text marks when changing type', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'heading-two',
          id: 'stable-heading',
          children: [{ bold: true, text: 'Title' }],
        } as Descendant,
      ],
      selection: collapsedSelection([0, 0], 0),
      marks: null,
    });

    editor.update((tx) => {
      tx.nodes.set<Element>({ type: 'heading-three' }, { at: [0] });
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        type: 'heading-three',
        id: 'stable-heading',
        children: [{ bold: true, text: 'Title' }],
      },
    ]);
  });

  it('insertNodes can split the highest selected block for root-level insertion', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'section',
          children: [
            {
              type: 'paragraph',
              children: [{ text: 'Helloworld' }],
            },
          ],
        } as Descendant,
      ],
      selection: collapsedSelection([0, 0, 0], 5),
      marks: null,
    });

    editor.update((tx) => {
      tx.nodes.insert(
        {
          type: 'embed',
          children: [{ text: '' }],
        } as Descendant,
        { mode: 'highest' }
      );
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        type: 'section',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'Hello' }],
          },
        ],
      },
      {
        type: 'embed',
        children: [{ text: '' }],
      },
      {
        type: 'section',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'world' }],
          },
        ],
      },
    ]);
    assert.deepEqual(
      Editor.getSnapshot(editor).selection,
      collapsedSelection([1, 0], 0)
    );
  });

  it('splitNodes rejects the editor root as a split target', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'one' }],
        } as Descendant,
      ],
      selection: null,
      marks: null,
    });

    assert.throws(() => {
      Editor.splitNodes(editor, { at: [], position: 0 });
    }, /Cannot split the editor root/);
  });

  it('insertNodes rejects the editor root as an insertion target', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'one' }],
        } as Descendant,
      ],
      selection: null,
      marks: null,
    });

    assert.throws(() => {
      Editor.insertNodes(
        editor,
        {
          type: 'embed',
          children: [{ text: '' }],
        } as Descendant,
        { at: [] }
      );
    }, /Cannot insert into the editor root/);
  });

  it('removeNodes rejects the editor root as a removal target', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'one' }],
        } as Descendant,
      ],
      selection: null,
      marks: null,
    });

    assert.throws(() => {
      Editor.removeNodes(editor, { at: [] });
    }, /Cannot remove the editor root/);
  });

  it('removeNodes can match children from the editor root', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'one' }],
        } as Descendant,
        {
          type: 'slash_input',
          children: [{ text: '' }],
        } as Descendant,
      ],
      selection: null,
      marks: null,
    });

    Editor.removeNodes(editor, {
      at: [],
      match: (node) => 'type' in node && node.type === 'slash_input',
    });

    assert.deepEqual(
      editor.read((state) => state.value.root()),
      [
        {
          type: 'paragraph',
          children: [{ text: 'one' }],
        },
      ]
    );
  });

  it('setNodes can target the highest matching inline when mode is highest', () => {
    const editor = createEditor();
    editor.extend(
      defineEditorExtension({
        elements: [{ inline: true, type: 'inline' }],
        name: 'inline',
      })
    );

    Editor.replace(editor, {
      children: [
        {
          type: 'block',
          children: [
            { text: '' },
            {
              type: 'inline',
              children: [
                { text: '' },
                { type: 'inline', children: [{ text: 'word' }] },
                { text: '' },
              ],
            },
            { text: '' },
          ],
        } as Descendant,
      ],
      selection: collapsedSelection([0, 1, 1, 0], 0),
      marks: null,
    });

    editor.update((tx) => {
      tx.nodes.set(
        { someKey: true },
        {
          match: (node) => 'children' in node && tx.schema.isInline(node),
          mode: 'highest',
        }
      );
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        type: 'block',
        children: [
          { text: '' },
          {
            type: 'inline',
            someKey: true,
            children: [
              { text: '' },
              {
                type: 'inline',
                children: [{ text: 'word' }],
              },
              { text: '' },
            ],
          },
          { text: '' },
        ],
      },
    ]);
  });

  it('wrapNodes can split a selected block range', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        { type: 'block', children: [{ text: 'one' }] },
        { type: 'block', children: [{ text: 'two' }] },
      ],
      selection: {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [1, 0], offset: 1 },
      },
      marks: null,
    });

    editor.update((tx) => {
      tx.nodes.wrap({ type: 'quote', children: [] } as Element, {
        split: true,
      });
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      { type: 'block', children: [{ text: 'on' }] },
      {
        type: 'quote',
        children: [
          { type: 'block', children: [{ text: 'e' }] },
          { type: 'block', children: [{ text: 't' }] },
        ],
      },
      { type: 'block', children: [{ text: 'wo' }] },
    ]);
  });

  it('wrapNodes can honor match and leave rejected nodes alone', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'block',
          noneditable: true,
          children: [{ text: 'word' }],
        } as Descendant,
      ],
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
      marks: null,
    });

    editor.update((tx) => {
      tx.nodes.wrap({ type: 'quote', children: [] } as Element, {
        match: (node, currentPath) => {
          if ('noneditable' in node && node.noneditable === true) return false;

          for (const [ancestor] of NodeApi.ancestors(editor, currentPath)) {
            if ('noneditable' in ancestor && ancestor.noneditable === true) {
              return false;
            }
          }

          return true;
        },
      });
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      {
        type: 'block',
        noneditable: true,
        children: [{ text: 'word' }],
      },
    ]);
  });

  it('unwrapNodes can honor match with mode all', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'block',
          a: true,
          children: [
            {
              type: 'block',
              a: true,
              children: [{ type: 'block', children: [{ text: 'word' }] }],
            },
          ],
        } as Descendant,
      ],
      selection: {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      },
      marks: null,
    });

    editor.update((tx) => {
      tx.nodes.unwrap({
        match: (node) => 'a' in node && node.a === true,
        mode: 'all',
      });
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      { type: 'block', children: [{ text: 'word' }] },
    ]);
  });

  it('liftNodes and unwrapNodes no-op when the selection has no valid wrapper target', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        { type: 'block', children: [{ text: 'one' }] },
        { type: 'block', children: [{ text: 'two' }] },
      ],
      selection: {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [1, 0], offset: 2 },
      },
      marks: null,
    });

    editor.update((tx) => {
      tx.nodes.lift();
      tx.nodes.unwrap();
    });

    const after = Editor.getSnapshot(editor);

    assert.deepEqual(after.children, [
      { type: 'block', children: [{ text: 'one' }] },
      { type: 'block', children: [{ text: 'two' }] },
    ]);
    assert.deepEqual(after.selection, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 2 },
    });
    assert.equal(after.marks, null);
  });

  it('liftNodes can target inside a void element when voids is true', () => {
    const editor = createEditor();
    editor.extend(
      defineEditorExtension({
        elements: [
          {
            type: 'void-flag',
            match: (element) => element.void === true,
            void: 'block',
          },
        ],
        name: 'void-flag',
      })
    );

    Editor.replace(editor, {
      children: [
        {
          type: 'block',
          void: true,
          children: [{ type: 'block', children: [{ text: 'word' }] }],
        } as Descendant,
      ],
      selection: null,
      marks: null,
    });

    editor.update((tx) => {
      tx.nodes.lift({ at: [0, 0], voids: true });
    });

    assert.deepEqual(Editor.getSnapshot(editor).children, [
      { type: 'block', children: [{ text: 'word' }] },
    ]);
  });
});
