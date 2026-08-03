import type { Descendant } from '@platejs/plite';
import { createDataTransfer } from '@platejs/test-utils';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { PlateStatic } from '../components/PlateStatic';
import { createStaticEditor } from '../editor/withStatic';
import * as getSelectedDomFragmentModule from '../utils/getSelectedDomFragment';
import * as getSelectedDomNodeModule from '../utils/getSelectedDomNode';
import * as isSelectOutsideModule from '../utils/isSelectOutside';
import { writeStaticSelectionClipboardData } from './writeStaticSelectionClipboardData';

describe('writeStaticSelectionClipboardData', () => {
  let getSelectedDomFragmentSpy: ReturnType<typeof spyOn>;
  let getSelectedDomNodeSpy: ReturnType<typeof spyOn>;
  let isSelectOutsideSpy: ReturnType<typeof spyOn>;

  afterEach(() => {
    getSelectedDomFragmentSpy?.mockRestore();
    getSelectedDomNodeSpy?.mockRestore();
    isSelectOutsideSpy?.mockRestore();
    window.getSelection()?.removeAllRanges();
    document.body.innerHTML = '';
  });

  it('returns false when no selected DOM node exists', () => {
    const editor = createStaticEditor();
    const data = createDataTransfer();

    getSelectedDomNodeSpy = spyOn(
      getSelectedDomNodeModule,
      'getSelectedDomNode'
    ).mockReturnValue(undefined);

    expect(writeStaticSelectionClipboardData(editor, data)).toBe(false);
  });

  it('returns false when the selection is outside the editor', () => {
    const editor = createStaticEditor();
    const data = createDataTransfer();
    const html = document.createElement('div');
    const editorDiv = document.createElement('div');

    editorDiv.dataset.pliteEditor = 'true';
    html.append(editorDiv);

    getSelectedDomNodeSpy = spyOn(
      getSelectedDomNodeModule,
      'getSelectedDomNode'
    ).mockReturnValue(html);
    isSelectOutsideSpy = spyOn(
      isSelectOutsideModule,
      'isSelectOutside'
    ).mockReturnValue(true);

    expect(writeStaticSelectionClipboardData(editor, data)).toBe(false);
  });

  it('writes Plite fragment, html, and plain text payloads', () => {
    const editor = createStaticEditor();
    const data = createDataTransfer();
    const fragment = [
      { children: [{ text: 'Alpha' }], type: 'paragraph' },
    ] satisfies Descendant[];
    const html = document.createElement('div');

    html.innerHTML = '<p>Alpha</p>';

    getSelectedDomFragmentSpy = spyOn(
      getSelectedDomFragmentModule,
      'getSelectedDomFragment'
    ).mockReturnValue(fragment);
    getSelectedDomNodeSpy = spyOn(
      getSelectedDomNodeModule,
      'getSelectedDomNode'
    ).mockReturnValue(html);
    isSelectOutsideSpy = spyOn(
      isSelectOutsideModule,
      'isSelectOutside'
    ).mockReturnValue(false);

    expect(writeStaticSelectionClipboardData(editor, data)).toBe(true);
    const encoded = data.getData('application/x-plite-fragment');

    expect(encoded).not.toBe('');
    expect(data.getData('text/html')).toBe(
      `<p data-plite-fragment="${encoded}" data-plite-fragment-format="x-plite-fragment">Alpha</p>`
    );
    expect(data.getData('text/plain')).toBe('Alpha');
  });

  it('writes Plite fragment from rendered static DOM', () => {
    const editor = createStaticEditor({
      nodeId: true,
      initialValue: [
        {
          id: 'block-1',
          children: [{ text: 'Alpha' }],
          type: 'paragraph',
        },
      ],
    });
    const data = createDataTransfer();

    document.body.innerHTML = ReactDOMServer.renderToStaticMarkup(
      React.createElement(PlateStatic, { editor })
    );

    const block = document.querySelector('[data-block-id="block-1"]');

    expect(block).toBeTruthy();

    const range = document.createRange();
    const selection = window.getSelection()!;

    range.selectNode(block!);
    selection.removeAllRanges();
    selection.addRange(range);

    expect(writeStaticSelectionClipboardData(editor, data)).toBe(true);
    expect(data.getData('application/x-plite-fragment')).not.toBe('');
  });
});
