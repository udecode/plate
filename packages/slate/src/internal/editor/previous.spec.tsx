/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

import { createEditor } from '../../create-editor';

jsx;

describe('previous', () => {
  describe('when using from option', () => {
    const editor = createEditor(
      (
        <editor>
          <element id="1">
            <text>Block One</text>
          </element>
          <element id="2">
            <element id="2-1">
              <text>Child One</text>
            </element>
            <element id="2-2">
              <text>Child Two</text>
            </element>
          </element>
          <element id="3">
            <text>Block Three</text>
          </element>
        </editor>
      ) as any
    );

    it('should traverse from point before when from="before"', () => {
      const prev = editor.api.previous({ at: [2] });
      expect(prev![0].id).toBe('2');
    });

    it('should get previous when from="parent"', () => {
      const prev = editor.api.previous({
        at: [1, 1], // at 2-2
        block: true,
        from: 'parent',
      });
      expect(prev![0].id).toBe('2-1');
    });

    it('should traverse from parent when from="parent"', () => {
      const prev = editor.api.previous({
        at: [1, 0], // at 2-1
        block: true,
        from: 'parent',
      });
      expect(prev![0].id).toBe('2');
    });
  });

  describe('when using match option', () => {
    const editor = createEditor(
      (
        <editor>
          <element id="1" type="p">
            <text>Block One</text>
          </element>
          <element id="2" type="div">
            <element id="2-1" type="p">
              <text>Child One</text>
            </element>
          </element>
          <element id="3" type="p">
            <text>Block Three</text>
          </element>
        </editor>
      ) as any
    );

    it('should find previous node matching criteria', () => {
      const prev = editor.api.previous({
        at: [2],
        match: (n) => 'type' in n && n.type === 'p',
      });
      expect(prev![0].id).toBe('2-1');
    });
  });

  describe('when using nested blocks', () => {
    const editor = createEditor(
      (
        <editor>
          <element id="1">
            <text>Block One</text>
          </element>
          <element id="table" type="table">
            <element id="row1" type="table-row">
              <element id="cell1-1" type="table-cell">
                <text>Cell 1-1</text>
              </element>
              <element id="cell1-2" type="table-cell">
                <text>Cell 1-2</text>
              </element>
            </element>
            <element id="row2" type="table-row">
              <element id="cell2-1" type="table-cell">
                <text>Cell 2-1</text>
              </element>
            </element>
          </element>
          <element id="3">
            <text>Block Three</text>
          </element>
        </editor>
      ) as any
    );

    it('should traverse from cell to parent row when from="parent"', () => {
      const prev = editor.api.previous({
        at: [1, 1, 0], // at cell2-1
        block: true,
        from: 'parent',
      });
      expect(prev![0].id).toBe('row2');
    });

    it('should traverse from table to previous block when from="before"', () => {
      const prev = editor.api.previous({
        at: [1], // table path
        from: 'before',
      });
      expect(prev![0].id).toBe('1');
    });
  });
});

const nodesFixture5 = [
  {
    id: '1',
    children: [{ text: '' }],
    type: 'p',
  },
  {
    id: '2',
    children: [{ text: '' }],
    type: 'p',
  },
  {
    id: '3',
    children: [{ text: '' }],
    type: 'p',
  },
];

const nodesFixtureWithList = [
  {
    id: '1',
    children: [{ text: '' }],
    type: 'p',
  },
  {
    id: '2',
    children: [
      {
        id: '21',
        children: [{ id: '211', children: [{ text: 'hi' }], type: 'p' }],
        type: 'li',
      },
      {
        id: '22',
        children: [{ id: '221', children: [{ text: 'hi' }], type: 'p' }],
        type: 'li',
      },
      {
        id: '23',
        children: [{ id: '231', children: [{ text: 'hi' }], type: 'p' }],
        type: 'li',
      },
    ],
    type: 'ul',
  },
  {
    id: '3',
    children: [{ text: '' }],
    type: 'p',
  },
];

describe('when getting previous node by id', () => {
  describe('when not first block', () => {
    it('should return the previous block', () => {
      const e = createEditor();
      e.children = nodesFixture5;
      expect(e.api.previous({ id: '3', block: true })?.[0]).toEqual(
        nodesFixture5[1]
      );
    });
  });

  describe('when first block', () => {
    it('should return undefined', () => {
      const e = createEditor();
      e.children = nodesFixture5;
      expect(e.api.previous({ id: '1', block: true })).toBeUndefined();
    });
  });

  describe('when not found', () => {
    it('should return undefined', () => {
      const e = createEditor();
      e.children = nodesFixture5;
      expect(e.api.previous({ id: '11', block: true })?.[0]).toBeUndefined();
    });
  });

  describe('when list', () => {
    it('should return previous block', () => {
      const e = createEditor();
      e.children = nodesFixtureWithList;
      expect(e.api.previous({ id: '2', block: true })?.[0]).toEqual(
        nodesFixtureWithList[0]
      );
    });
  });
});

describe('sibling', () => {
  const nodesFixture = [
    {
      id: '1',
      children: [{ text: 'first' }],
      type: 'p',
    },
    {
      id: '2',
      children: [{ text: 'second' }],
      type: 'p',
    },
    {
      id: '3',
      children: [{ text: 'third' }],
      type: 'p',
    },
  ];

  const nestedNodesFixture = [
    {
      id: 'parent',
      children: [
        {
          id: 'child1',
          children: [{ text: 'first child' }],
          type: 'p',
        },
        {
          id: 'child2',
          children: [{ text: 'second child' }],
          type: 'p',
        },
      ],
      type: 'div',
    },
  ];

  describe('when getting previous sibling node', () => {
    describe('when has previous sibling', () => {
      it('should return the previous sibling', () => {
        const editor = createEditor();
        editor.children = nodesFixture;

        const result = editor.api.previous({ at: [1], sibling: true });

        expect(result?.[0]).toEqual(nodesFixture[0]);
        expect(result?.[1]).toEqual([0]);
      });
    });

    describe('when is first child', () => {
      it('should return undefined', () => {
        const editor = createEditor();
        editor.children = nodesFixture;

        const result = editor.api.previous({ at: [0], sibling: true });

        expect(result).toBeUndefined();
      });
    });

    describe('when nested nodes', () => {
      it('should return previous sibling at correct level', () => {
        const editor = createEditor();
        editor.children = nestedNodesFixture;

        const result = editor.api.previous({ at: [0, 1], sibling: true });

        expect(result?.[0]).toEqual(nestedNodesFixture[0].children[0]);
        expect(result?.[1]).toEqual([0, 0]);
      });
    });

    describe('when path is invalid', () => {
      it('should return undefined', () => {
        const editor = createEditor();
        editor.children = nodesFixture;

        const result = editor.api.previous({ at: undefined, sibling: true });

        expect(result).toBeUndefined();
      });
    });
  });
});
