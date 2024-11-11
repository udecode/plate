/** @jsx jsx */

import {
  type SlateEditor,
  createSlateEditor,
  insertNodes,
  mergeNodes,
  splitNodes,
} from '@udecode/plate-common';
import { ParagraphPlugin } from '@udecode/plate-common/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { BulletedListPlugin, ListItemPlugin } from '@udecode/plate-list/react';
import { jsx } from '@udecode/plate-test-utils';

import { NodeIdPlugin } from './NodeIdPlugin';

jsx;

const getIdFactory = () => {
  let id = 1;

  return () => id++;
};

describe('when normalizing initial value', () => {
  it('should not add id to inline nodes', () => {
    const input = (
      <editor>
        <hp>
          test1
          <ha>link</ha>
          test2
        </hp>
        <hp>
          <ha>link2</ha>
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [
        NodeIdPlugin.configure({
          options: {
            idCreator: getIdFactory(),
          },
        }),
        LinkPlugin,
      ],
      value: input.children,
    });

    // Block elements should have IDs
    expect(editor.children[0].id).toBe(1);
    expect(editor.children[1].id).toBe(2);

    // Inline elements should not have IDs
    expect((editor.children[0] as any).children[1].id).toBeUndefined();
    expect((editor.children[1] as any).children[0].id).toBeUndefined();
  });

  it('should add id to inline nodes', () => {
    const input = (
      <editor>
        <hp>
          test1
          <ha>link</ha>
          test2
        </hp>
        <hp>
          <ha>link2</ha>
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [
        NodeIdPlugin.configure({
          options: {
            filterInline: false,
            idCreator: getIdFactory(),
          },
        }),
        LinkPlugin,
      ],
      value: input.children,
    });

    // Block elements should have IDs
    expect(editor.children[0].id).toBe(1);
    expect(editor.children[1].id).toBe(3);

    // Inline elements should have IDs
    expect((editor.children[0] as any).children[1].id).toBe(2);
    expect((editor.children[1] as any).children[0].id).toBe(4);
  });

  it('should add ids to all nodes when normalizeInitialValue is true', () => {
    const input = (
      <editor>
        <hp id={2}>test1</hp>
        <hp>test2</hp>
        <hli id={3}>
          <hp id={4}>test3</hp>
        </hli>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [
        NodeIdPlugin.configure({
          options: {
            idCreator: getIdFactory(),
            normalizeInitialValue: true,
          },
        }),
      ],
      value: input.children,
    });

    // All nodes should have sequential IDs
    expect(editor.children[1].id).toBe(1);
  });

  it('should only add ids to first and last nodes when normalizeInitialValue is false', () => {
    const input = (
      <editor>
        <hp>test1</hp>
        <hp>test2</hp>
        <hp id={3}>test3</hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [
        NodeIdPlugin.configure({
          options: {
            idCreator: getIdFactory(),
          },
        }),
      ],
      value: input.children,
    });

    // Only first and last nodes should have IeDs
    expect(editor.children[0].id).toBe(1);
  });
});

describe('when inserting nodes', () => {
  describe('when allow is p, inserting li and p', () => {
    it('should add an id to the inserted p but not li', () => {
      const input = (
        <editor>
          <hp id={10}>
            test
            <cursor />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hp id={10}>test</hp>
          <hli>
            <hp id={1}>inserted</hp>
          </hli>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        editor: input,
        plugins: [
          NodeIdPlugin.configure({
            options: {
              allow: [ParagraphPlugin.key],
              idCreator: getIdFactory(),
              reuseId: true,
            },
          }),
        ],
      });

      editor.insertNode(
        (
          <hli>
            <hp>inserted</hp>
          </hli>
        ) as any
      );

      editor.undo();
      editor.redo();
      editor.undo();
      editor.redo();

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when exclude is p, inserting li and p', () => {
    it('should add an id to li but not p', () => {
      const input = (
        <editor>
          <hp id={10}>
            test
            <cursor />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hp id={10}>test</hp>
          <hli id={1}>
            <hp>inserted</hp>
          </hli>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        editor: input,
        plugins: [
          NodeIdPlugin.configure({
            options: {
              exclude: [ParagraphPlugin.key],
              idCreator: getIdFactory(),
              reuseId: true,
            },
          }),
        ],
      });

      editor.insertNode(
        (
          <hli>
            <hp>inserted</hp>
          </hli>
        ) as any
      );

      editor.undo();
      editor.redo();

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when allow and exclude includes the same type', () => {
    it('should not add an id to this type', () => {
      const input = (
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hp>test</hp>
          <hul id={1}>
            <hli id={2}>
              <hp>inserted</hp>
            </hli>
          </hul>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        editor: input,
        plugins: [
          NodeIdPlugin.configure({
            options: {
              allow: [
                BulletedListPlugin.key,
                ListItemPlugin.key,
                ParagraphPlugin.key,
              ],
              exclude: [ParagraphPlugin.key],
              idCreator: getIdFactory(),
              reuseId: true,
            },
          }),
        ],
      });

      editor.insertNode(
        (
          <hul>
            <hli>
              <hp>inserted</hp>
            </hli>
          </hul>
        ) as any
      );

      editor.undo();
      editor.redo();

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when inserting nested nodes', () => {
    it('should recursively add an id to the elements', () => {
      const input = (
        <editor>
          <hp id={10}>
            test
            <cursor />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hp id={10}>test</hp>
          <hli id={1}>
            <hp id={2}>inserted</hp>
          </hli>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        editor: input,
        plugins: [
          NodeIdPlugin.configure({
            options: {
              idCreator: getIdFactory(),
              reuseId: true,
            },
          }),
        ],
      });

      editor.insertNode(
        (
          <hli>
            <hp>inserted</hp>
          </hli>
        ) as any
      );

      editor.undo();
      editor.redo();

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when inserting nested nodes without filter text', () => {
    it('should add an id to the new nodes', () => {
      const input = (
        <editor>
          <hp id={10}>
            test
            <cursor />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hp id={10}>test</hp>
          <hli id={1}>
            <hp id={2}>
              <htext id={3}>inserted</htext>
            </hp>
          </hli>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        editor: input,
        plugins: [
          NodeIdPlugin.configure({
            options: {
              filterText: false,
              idCreator: getIdFactory(),
            },
          }),
        ],
      });

      editor.insertNode(
        (
          <hli>
            <hp>inserted</hp>
          </hli>
        ) as any
      );

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when undo/redo', () => {
    it('should recover ids', () => {
      const input = (
        <editor>
          <hp id={10}>
            test
            <cursor />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hp id={10}>test</hp>
          <hp id={1}>inserted</hp>
          <hp id={2}>inserted</hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        editor: input,
        plugins: [
          NodeIdPlugin.configure({
            options: {
              idCreator: getIdFactory(),
              reuseId: true,
            },
          }),
        ],
      });

      insertNodes(
        editor,
        (
          <fragment>
            <hp>inserted</hp>
            <hp>inserted</hp>
          </fragment>
        ) as any
      );

      editor.undo();
      editor.redo();
      editor.undo();
      editor.redo();

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when undo/redo without reuseId', () => {
    it('should recover ids', () => {
      const input = (
        <editor>
          <hp id={10}>
            test
            <cursor />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hp id={10}>test</hp>
          <hp id={5}>inserted</hp>
          <hp id={6}>inserted</hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        editor: input,
        plugins: [
          NodeIdPlugin.configure({ options: { idCreator: getIdFactory() } }),
        ],
      });

      insertNodes(
        editor,
        (
          <fragment>
            <hp>inserted</hp>
            <hp>inserted</hp>
          </fragment>
        ) as any
      );

      editor.undo();
      editor.redo();
      editor.undo();
      editor.redo();

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when idKey is foo', () => {
    it('should add an id using foo key', () => {
      const input = (
        <editor>
          <hp foo={10}>test</hp>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hp foo={10}>test</hp>
          <hp foo={1}>inserted</hp>
          <hp foo={2}>inserted</hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        editor: input,
        plugins: [
          NodeIdPlugin.configure({
            options: {
              idCreator: getIdFactory(),
              idKey: 'foo',
              reuseId: true,
            },
          }),
        ],
      });

      insertNodes(
        editor,
        (
          <fragment>
            <hp>inserted</hp>
            <hp>inserted</hp>
          </fragment>
        ) as any
      );

      editor.undo();
      editor.redo();
      editor.undo();
      editor.redo();

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when inserting a node with an id already used', () => {
    it('should create a new id for that node', () => {
      const input = (
        <editor>
          <hp id={10}>
            test
            <cursor />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hp id={10}>test</hp>
          <hp id={11}>inserted</hp>
          <hp id={2}>inserted</hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        editor: input,
        plugins: [
          NodeIdPlugin.configure({
            options: {
              idCreator: getIdFactory(),
              reuseId: true,
            },
          }),
        ],
      });

      insertNodes(
        editor,
        (
          <fragment>
            <hp id={11}>inserted</hp>
          </fragment>
        ) as any
      );

      insertNodes(
        editor,
        (
          <fragment>
            <hp id={11}>inserted</hp>
          </fragment>
        ) as any
      );

      expect(input.children).toEqual(output.children);
    });
  });
});

describe('when splitting nodes', () => {
  describe('when default', () => {
    it('should add an id to the splitted p', () => {
      const input = (
        <editor>
          <hp id={10}>
            tes
            <cursor />t
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        editor: input,
        plugins: [NodeIdPlugin],
      });

      splitNodes(editor);

      expect(input.children[1].id).toBeDefined();
    });
  });

  describe('when splitting p', () => {
    it('should add an id to the new p', () => {
      const input = (
        <editor>
          <hp id={10}>
            tes
            <cursor />t
          </hp>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hp id={10}>tes</hp>
          <hp id={1}>t</hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        editor: input,
        plugins: [
          NodeIdPlugin.configure({
            options: {
              idCreator: getIdFactory(),
              reuseId: true,
            },
          }),
        ],
      });

      splitNodes(editor);

      editor.undo();
      editor.redo();
      editor.undo();
      editor.redo();

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when splitting p without reuseId', () => {
    it('should add an id to the new p', () => {
      const input = (
        <editor>
          <hp id={10}>
            tes
            <cursor />t
          </hp>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hp id={10}>tes</hp>
          <hp id={3}>t</hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        editor: input,
        plugins: [
          NodeIdPlugin.configure({ options: { idCreator: getIdFactory() } }),
        ],
      });

      splitNodes(editor);

      editor.undo();
      editor.redo();
      editor.undo();
      editor.redo();

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when allow is only p', () => {
    it('should not add an id to li', () => {
      const input = (
        <editor>
          <hli>
            tes
            <cursor />t
          </hli>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hli>tes</hli>
          <hli>t</hli>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        editor: input,
        plugins: [
          NodeIdPlugin.configure({
            options: {
              allow: [ParagraphPlugin.key],
              idCreator: getIdFactory(),
            },
          }),
        ],
      });

      splitNodes(editor);

      editor.undo();
      editor.redo();
      editor.undo();
      editor.redo();

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when splitting p without filtering text', () => {
    it('should add an id to the new p and text', () => {
      const input = (
        <editor>
          <hp id={10}>
            tes
            <cursor />t
          </hp>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hp id={10}>tes</hp>
          <hp id={2}>
            <htext id={1}>t</htext>
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        editor: input,
        plugins: [
          NodeIdPlugin.configure({
            options: {
              filterText: false,
              idCreator: getIdFactory(),
              reuseId: true,
            },
          }),
        ],
      });

      splitNodes(editor);

      editor.undo();
      editor.redo();

      expect(input.children).toEqual(output.children);
    });
  });
});

describe('when merging nodes', () => {
  describe('when merging texts', () => {
    it('should recover the ids', () => {
      const input = (
        <editor>
          <hp id={10}>
            <htext id={1}>tes</htext>
            <htext id={2}>t</htext>
          </hp>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hp id={10}>
            <htext id={1}>tes</htext>
            <htext id={2}>t</htext>
          </hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        editor: input,
        plugins: [
          NodeIdPlugin.configure({
            options: {
              filterText: false,
              idCreator: getIdFactory(),
              reuseId: true,
            },
          }),
        ],
      });

      mergeNodes(editor, { at: [0, 1] });
      editor.undo();

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when merging elements', () => {
    it('should recover the ids', () => {
      const input = (
        <editor>
          <hp id={1}>one</hp>
          <hp id={2}>two</hp>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hp id={1}>one</hp>
          <hp id={2}>two</hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        editor: input,
        plugins: [
          NodeIdPlugin.configure({ options: { idCreator: getIdFactory() } }),
        ],
      });

      mergeNodes(editor, { at: [1] });
      editor.undo();
      editor.redo();
      editor.undo();

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when filter by path', () => {
    it('should work', () => {
      const input = (
        <editor>
          <hp id={10}>
            test
            <cursor />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hp id={10}>test</hp>
          <hp>
            <htext />
          </hp>
          <hli>
            <hp id={1}>inserted</hp>
          </hli>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        editor: input,
        plugins: [
          NodeIdPlugin.configure({
            options: {
              filter: ([, path]) => path.length === 2,
              idCreator: getIdFactory(),
            },
          }),
        ],
      });

      editor.insertBreak();
      editor.insertNode(
        (
          <hli>
            <hp>inserted</hp>
          </hli>
        ) as any
      );

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when id override', () => {
    it('should work', () => {
      const input = (
        <editor>
          <hp id={10}>
            test
            <cursor />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hp id={10}>test</hp>
          <hli id={1}>
            <hp id={11}>inserted</hp>
          </hli>
          <hp id={12}>test</hp>
        </editor>
      ) as any;

      const editor = createSlateEditor({
        editor: input,
        plugins: [
          NodeIdPlugin.configure({
            options: {
              idCreator: getIdFactory(),
            },
          }),
        ],
      });

      editor.insertNodes([
        (
          <hli>
            <hp _id={11}>inserted</hp>
          </hli>
        ) as any,
        <hp _id={12}>test</hp>,
      ]);

      expect(input.children).toEqual(output.children);
    });
  });
});
