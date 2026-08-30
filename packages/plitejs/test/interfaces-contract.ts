import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  ElementApi,
  LocationApi,
  NodeApi,
  PathApi,
  PointApi,
  RangeApi,
  SelectionApi,
  SpanApi,
  TextApi,
} from 'plitejs';

import {
  getSelection as editorGetSelection,
  hasPath as editorHasPath,
  isEditor as editorIsEditor,
  replace as editorReplace,
  string as editorString,
} from '../src/internal';

const typeOnly = (_callback: () => void) => {};

typeOnly(() => {
  // @ts-expect-error pure API namespaces are immutable
  ElementApi.isElement = () => false;
  // @ts-expect-error pure API namespaces are immutable
  SelectionApi.isSelection = () => false;
});

describe('plite interfaces contract', () => {
  it('freezes every pure public API namespace', () => {
    for (const api of [
      ElementApi,
      LocationApi,
      NodeApi,
      PathApi,
      PointApi,
      RangeApi,
      SelectionApi,
      SpanApi,
      TextApi,
    ]) {
      assert.equal(Object.isFrozen(api), true);
    }
  });

  it('treats editors as nodes, not elements', () => {
    const editor = createEditor();

    assert.equal(NodeApi.isNode(editor), true);
    assert.equal(ElementApi.isElement(editor), false);
  });

  it('treats elements and text as descendants, not editor roots', () => {
    const editor = createEditor();
    const element = { children: [{ text: '' }], type: 'paragraph' };
    const text = { text: '' };

    assert.equal(NodeApi.isDescendant(editor), false);
    assert.equal(NodeApi.isDescendant(element), true);
    assert.equal(NodeApi.isDescendant(text), true);
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

  it('checks node props while letting callers define metadata', () => {
    const paragraph = { children: [{ text: '' }], type: 'paragraph' };

    assert.equal(NodeApi.hasProps({ text: '' }), false);
    assert.equal(NodeApi.hasProps({ bold: true, text: '' }), true);
    assert.equal(NodeApi.hasProps(paragraph), true);
    assert.equal(
      NodeApi.hasProps(paragraph, {
        ignore: (key) => key === 'type',
      }),
      false
    );
    assert.equal(
      NodeApi.hasProps(
        { ...paragraph, id: 'a' },
        {
          ignore: (key) => key === 'type',
        }
      ),
      true
    );
  });

  it('rejects plain objects as nodes', () => {
    assert.equal(NodeApi.isNode({}), false);
  });

  it('recognizes ranges', () => {
    assert.equal(
      RangeApi.isRange({
        kind: 'text',
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 1], offset: 0 },
      }),
      true
    );
  });

  it('rejects values outside the public selection types', () => {
    const point = { offset: 0, path: [0, 0] };

    for (const value of [
      {
        affinity: 'sideways',
        anchor: point,
        focus: point,
        kind: 'text',
      },
      {
        anchor: point,
        focus: point,
        kind: 'text',
        marks: 42,
      },
    ]) {
      assert.equal(SelectionApi.isSelection(value), false);
      assert.equal(SelectionApi.isText(value), false);
    }

    assert.equal(
      SelectionApi.isText({
        anchor: point,
        focus: { ...point, offset: 1 },
        kind: 'text',
        marks: { bold: true },
      }),
      false
    );
  });

  it('normalizes range edges and intersections by document order', () => {
    const backwardRange = {
      kind: 'text',
      anchor: { path: [0, 0], offset: 8 },
      focus: { path: [0, 0], offset: 2 },
    };
    const overlapRange = {
      kind: 'text',
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
      kind: 'text',
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 5 },
    });
  });

  it('distinguishes intersecting ranges from fully surrounded ranges', () => {
    const selection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 8 },
    };
    const backwardSelection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 8 },
      focus: { path: [0, 0], offset: 2 },
    };
    const endpointOnlyRange = {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    };
    const interiorRange = {
      kind: 'text',
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
    assert.equal(RangeApi.equals(null, null), true);
    assert.equal(
      RangeApi.equals({ anchor: mainPoint, focus: mainPoint }, null),
      false
    );
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
    assert.equal(editorGetSelection(editor), null);
    assert.equal('children' in editor, false);
    assert.equal('selection' in editor, false);
  });

  it('recognizes editor instances with unrelated user metadata', () => {
    const editor = createEditor() as ReturnType<typeof createEditor> & {
      customMetadata?: unknown[];
    };

    editorReplace(editor, {
      children: [{ type: 'paragraph', children: [{ text: 'one' }] }],
      selection: null,
    });

    editor.customMetadata = [
      {
        type: 'custom_record',
        path: [0],
      },
    ];

    assert.equal(editorIsEditor(editor), true);
    assert.equal(editorHasPath(editor, [0, 0]), true);
    assert.equal(editorString(editor, []), 'one');
    assert.equal(NodeApi.isNode(editor), true);
  });
});
