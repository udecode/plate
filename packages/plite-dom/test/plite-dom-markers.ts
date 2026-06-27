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
} from '../src/internal';

describe('plite-dom markers', () => {
  test('owns Plite DOM boundary predicates', () => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    const { document } = dom.window;

    const root = document.createElement('div');
    root.setAttribute('data-plite-editor', 'true');

    const element = document.createElement('p');
    element.setAttribute('data-plite-node', 'element');
    root.append(element);

    const text = document.createElement('span');
    text.setAttribute('data-plite-node', 'text');

    const leaf = document.createElement('span');
    leaf.setAttribute('data-plite-leaf', 'true');

    const string = document.createElement('span');
    string.setAttribute('data-plite-string', 'true');

    const voidElement = document.createElement('div');
    voidElement.setAttribute('data-plite-void', 'true');

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
      'data-plite-background-color'
    );
    expect(keyToDataAttribute('URLValue')).toBe('data-plite-url-value');
    expect(
      getNodeDataAttributeKeys({
        type: 'paragraph',
        children: [{ text: 'A' }],
        id: 'p1',
      })
    ).toEqual(['data-plite-type', 'data-plite-id']);
    expect(
      getNodeDataAttributeKeys({
        bold: true,
        text: 'A',
      })
    ).toEqual(['data-plite-bold']);
  });
});
