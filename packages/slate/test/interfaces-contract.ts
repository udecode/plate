import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Editor } from '@platejs/slate/internal';

import {
  createEditor,
  ElementApi,
  NodeApi,
  OperationApi,
  PointApi,
  RangeApi,
  TextApi,
} from '../src';

describe('slate interfaces contract', () => {
  it('treats editors as nodes, not elements', () => {
    const editor = createEditor();

    assert.equal(NodeApi.isNode(editor), true);
    assert.equal(ElementApi.isElement(editor), false);
  });

  it('treats arrays of editor-like values as not an element list', () => {
    const editor = createEditor();

    assert.equal(ElementApi.isElementList([editor]), false);
  });

  it('treats plain text objects as text', () => {
    assert.equal(TextApi.isText({ text: '' }), true);
  });

  it('rejects invalid text props without throwing', () => {
    const inheritedText = Object.create({ text: '' });

    assert.equal(TextApi.isTextProps(null), false);
    assert.equal(TextApi.isTextProps(undefined), false);
    assert.equal(TextApi.isTextProps('abc'), false);
    assert.equal(TextApi.isTextProps({}), false);
    assert.equal(TextApi.isTextProps(inheritedText), false);
    assert.equal(TextApi.isTextProps({ text: '' }), true);
  });

  it('rejects plain objects as nodes', () => {
    assert.equal(NodeApi.isNode({}), false);
  });

  it('recognizes move_node operations', () => {
    assert.equal(
      OperationApi.isOperation({
        type: 'move_node',
        path: [0],
        newPath: [1],
      }),
      true
    );
  });

  it('recognizes operation lists', () => {
    assert.equal(
      OperationApi.isOperationList([
        {
          type: 'set_node',
          path: [0],
          properties: {},
          newProperties: {},
        },
      ]),
      true
    );
  });

  it('keeps operation validation strict for custom operation-like objects', () => {
    const customOperation = {
      type: 'custom_operation',
      path: [0],
      payload: true,
    };

    assert.equal(OperationApi.isOperation(customOperation), false);
    assert.equal(
      OperationApi.isOperationList([
        {
          offset: 0,
          path: [0, 0],
          text: 'x',
          type: 'insert_text',
        },
        customOperation,
      ]),
      false
    );
  });

  it('recognizes concrete operation subtypes', () => {
    assert.equal(
      OperationApi.isInsertTextOperation({
        offset: 0,
        path: [0, 0],
        text: 'x',
        type: 'insert_text',
      }),
      true
    );
    assert.equal(
      OperationApi.isReplaceChildrenOperation({
        children: [],
        index: 0,
        newChildren: [],
        newSelection: null,
        path: [],
        selection: null,
        type: 'replace_children',
      }),
      true
    );
    assert.equal(
      OperationApi.isInsertNodeOperation({
        type: 'custom_operation',
        path: [0],
        payload: true,
      }),
      false
    );
  });

  it('recognizes ranges', () => {
    assert.equal(
      RangeApi.isRange({
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 1], offset: 0 },
      }),
      true
    );
  });

  it('normalizes range edges and intersections by document order', () => {
    const backwardRange = {
      anchor: { path: [0, 0], offset: 8 },
      focus: { path: [0, 0], offset: 2 },
    };
    const overlapRange = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    };

    assert.deepEqual(RangeApi.edges(backwardRange), [
      { path: [0, 0], offset: 2 },
      { path: [0, 0], offset: 8 },
    ]);
    assert.deepEqual(RangeApi.edges(backwardRange, { reverse: true }), [
      { path: [0, 0], offset: 8 },
      { path: [0, 0], offset: 2 },
    ]);
    assert.deepEqual(RangeApi.start(backwardRange), {
      path: [0, 0],
      offset: 2,
    });
    assert.deepEqual(RangeApi.end(backwardRange), {
      path: [0, 0],
      offset: 8,
    });
    assert.deepEqual(RangeApi.intersection(backwardRange, overlapRange), {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 5 },
    });
  });

  it('distinguishes intersecting ranges from fully surrounded ranges', () => {
    const selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 8 },
    };
    const backwardSelection = {
      anchor: { path: [0, 0], offset: 8 },
      focus: { path: [0, 0], offset: 2 },
    };
    const endpointOnlyRange = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    };
    const interiorRange = {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 6 },
    };

    assert.equal(RangeApi.includes(selection, endpointOnlyRange), true);
    assert.equal(RangeApi.surrounds(selection, endpointOnlyRange), false);
    assert.equal(RangeApi.surrounds(selection, interiorRange), true);
    assert.equal(RangeApi.surrounds(backwardSelection, interiorRange), true);
    assert.equal(
      RangeApi.surrounds(backwardSelection, endpointOnlyRange),
      false
    );
  });

  it('keeps point and range comparisons root-aware', () => {
    const mainPoint = { path: [0, 0], offset: 1 };
    const explicitMainPoint = { path: [0, 0], offset: 1, root: 'main' };
    const headerPoint = { path: [0, 0], offset: 1, root: 'header' };

    assert.equal(PointApi.equals(mainPoint, explicitMainPoint), true);
    assert.equal(PointApi.equals(mainPoint, headerPoint), false);
    assert.equal(
      RangeApi.equals(
        { anchor: mainPoint, focus: mainPoint },
        { anchor: headerPoint, focus: headerPoint }
      ),
      false
    );
    assert.equal(
      RangeApi.intersection(
        {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 2 },
        },
        {
          anchor: { path: [0, 0], offset: 1, root: 'header' },
          focus: { path: [0, 0], offset: 2, root: 'header' },
        }
      ),
      null
    );
  });

  it('rejects insert_fragment operations whose at target is only a Path', () => {
    assert.equal(
      OperationApi.isOperation({
        type: 'insert_fragment',
        fragment: [],
        at: [0],
      }),
      false
    );
  });

  it('recognizes editor instances without stale public state fields', () => {
    const editor = createEditor() as ReturnType<typeof createEditor> & {
      exec?: () => void;
    };

    editor.exec = () => {};

    assert.equal('apply' in editor, false);
    assert.equal(
      Array.isArray(editor.read((state) => state.runtime.snapshot().children)),
      true
    );
    assert.equal(Editor.getSelection(editor), null);
    assert.equal('children' in editor, false);
    assert.equal('selection' in editor, false);
  });

  it('recognizes editor instances even when user code attaches custom operations', () => {
    const editor = createEditor() as ReturnType<typeof createEditor> & {
      operations?: unknown[];
    };

    Editor.replace(editor, {
      children: [{ type: 'paragraph', children: [{ text: 'one' }] }],
      selection: null,
    });

    editor.operations = [
      {
        type: 'custom_operation',
        path: [0],
      },
    ];

    assert.equal(Editor.isEditor(editor), true);
    assert.equal(Editor.hasPath(editor, [0, 0]), true);
    assert.equal(Editor.string(editor, []), 'one');
    assert.equal(NodeApi.isNode(editor), true);
  });
});
