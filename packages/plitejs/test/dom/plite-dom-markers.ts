import { JSDOM } from 'jsdom';

import {
  getNodeDataAttributeKeys,
  getElements,
  isEditor,
  isElement,
  isLeaf,
  isNode,
  isString,
  isText,
  isVoid,
  keyToDataAttribute,
} from '../../src/dom/internal';

describe('plite-dom markers', () => {
  test('owns Plite DOM boundary predicates', () => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    const { document } = dom.window;

    const root = document.createElement('div');
    root.setAttribute('data-editor', 'true');

    const element = document.createElement('p');
    element.setAttribute('data-editor-node', 'element');
    root.append(element);

    const text = document.createElement('span');
    text.setAttribute('data-editor-node', 'text');

    const leaf = document.createElement('span');
    leaf.setAttribute('data-editor-leaf', 'true');

    const string = document.createElement('span');
    string.setAttribute('data-editor-string', 'true');

    const voidElement = document.createElement('div');
    voidElement.setAttribute('data-editor-void', 'true');

    expect(isEditor(root)).toBe(true);
    expect(isElement(element)).toBe(true);
    expect(isText(text)).toBe(true);
    expect(isLeaf(leaf)).toBe(true);
    expect(isString(string)).toBe(true);
    expect(isVoid(voidElement)).toBe(true);
    expect(isNode(element)).toBe(true);
    expect(isNode(text)).toBe(true);
    expect(isNode(leaf)).toBe(true);
    expect(isNode(string)).toBe(true);
    expect(isNode(voidElement)).toBe(true);
    expect(getElements(root)).toEqual([element]);
  });

  test('owns Plite DOM data attribute names for primitive node props', () => {
    expect(keyToDataAttribute('backgroundColor')).toBe(
      'data-editor-background-color'
    );
    expect(keyToDataAttribute('URLValue')).toBe('data-editor-url-value');
    expect(
      getNodeDataAttributeKeys({
        type: 'paragraph',
        children: [{ text: 'A' }],
        id: 'p1',
      })
    ).toEqual(['data-editor-type', 'data-editor-id']);
    expect(
      getNodeDataAttributeKeys({
        bold: true,
        text: 'A',
      })
    ).toEqual(['data-editor-bold']);
  });
});
