import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { NodeApi, schema, TextApi } from '../../core';
import { definePlugin } from '../../lib';
import { createDataTransfer } from '../../testing';
import { EditorStatic } from '../components/PlateStatic';
import { createStaticEditor } from '../editor/withStatic';
import { writeStaticSelectionClipboardData } from './writeStaticSelectionClipboardData';

const renderEditor = (
  editor: ReturnType<typeof createStaticEditor>,
  document: Document = globalThis.document
) => {
  document.body.innerHTML = ReactDOMServer.renderToStaticMarkup(
    React.createElement(EditorStatic, { editor })
  );

  return document.querySelector<HTMLElement>('[data-editor]')!;
};

const select = (
  document: Document,
  start: Node,
  startOffset: number,
  end: Node,
  endOffset: number
) => {
  const range = document.createRange();

  range.setStart(start, startOffset);
  range.setEnd(end, endOffset);
  const selection = document.getSelection()!;

  selection.removeAllRanges();
  selection.addRange(range);
};

describe('writeStaticSelectionClipboardData', () => {
  afterEach(() => {
    document.getSelection()?.removeAllRanges();
    document.body.innerHTML = '';
  });

  it('declines absent and other-preview selections', () => {
    const editor = createStaticEditor({
      initialValue: [{ children: [{ text: 'Alpha' }], type: 'paragraph' }],
    });
    const first = renderEditor(editor);
    const second = document.createElement('div');

    second.innerHTML = ReactDOMServer.renderToStaticMarkup(
      React.createElement(EditorStatic, { editor })
    );
    const secondHost = second.firstElementChild as HTMLElement;
    document.body.append(secondHost);
    const secondText = secondHost.querySelector(
      '[data-editor-string]'
    )!.firstChild!;

    expect(
      writeStaticSelectionClipboardData(editor, createDataTransfer(), first)
    ).toBe(false);
    select(document, secondText, 0, secondText, 5);
    expect(
      writeStaticSelectionClipboardData(editor, createDataTransfer(), first)
    ).toBe(false);
    expect(
      writeStaticSelectionClipboardData(
        editor,
        createDataTransfer(),
        secondHost
      )
    ).toBe(true);
  });

  it('copies partial model text across blocks from exact coordinates', () => {
    const editor = createStaticEditor({
      initialValue: [
        { children: [{ text: 'Alpha' }], type: 'paragraph' },
        { children: [{ text: 'Omega' }], type: 'paragraph' },
      ],
    });
    const host = renderEditor(editor);
    const strings = host.querySelectorAll('[data-editor-string]');

    select(document, strings[0].firstChild!, 1, strings[1].firstChild!, 3);
    const data = createDataTransfer();

    expect(writeStaticSelectionClipboardData(editor, data, host)).toBe(true);
    const result = editor.api.dom.clipboard.readSlice(data);

    expect(result.kind).toBe('slice');
    if (result.kind !== 'slice') throw new Error('Expected exact slice.');
    expect(result.slice.content).toEqual([
      { children: [{ text: 'lpha' }], type: 'paragraph' },
      { children: [{ text: 'Ome' }], type: 'paragraph' },
    ]);
    expect(data.getData('text/plain')).toContain('lpha');
    expect(data.getData('text/html')).toContain('lpha');
  });

  it('resolves decorated segments to one model range', () => {
    const paint = definePlugin('paint', {
      decorate: {
        read: ({ entry: [node, path] }) =>
          TextApi.isText(node)
            ? [
                {
                  attributes: { 'data-paint': true },
                  key: 'paint',
                  range: {
                    anchor: { offset: 2, path },
                    focus: { offset: 4, path },
                  },
                },
              ]
            : [],
      },
    });
    const editor = createStaticEditor({
      initialValue: [{ children: [{ text: 'abcdef' }], type: 'paragraph' }],
      plugins: [paint],
    });
    const host = renderEditor(editor);
    const strings = host.querySelectorAll<HTMLElement>('[data-editor-string]');

    expect(
      Array.from(strings, (element) => [
        element.dataset.editorStart,
        element.dataset.editorEnd,
      ])
    ).toEqual([
      ['0', '2'],
      ['2', '4'],
      ['4', '6'],
    ]);
    select(document, strings[0].firstChild!, 1, strings[2].firstChild!, 1);
    const data = createDataTransfer();

    expect(writeStaticSelectionClipboardData(editor, data, host)).toBe(true);
    const result = editor.api.dom.clipboard.readSlice(data);

    expect(result.kind).toBe('slice');
    if (result.kind !== 'slice') throw new Error('Expected exact slice.');
    expect(NodeApi.string(result.slice.content[0])).toBe('bcde');
  });

  it('copies a selected empty sentinel as its model block', () => {
    const editor = createStaticEditor({
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    const host = renderEditor(editor);
    const marker = host.querySelector<HTMLElement>('[data-editor-string]')!;

    select(document, marker.firstChild!, 0, marker.firstChild!, 1);
    const data = createDataTransfer();

    expect(writeStaticSelectionClipboardData(editor, data, host)).toBe(true);
    const result = editor.api.dom.clipboard.readSlice(data);

    expect(result.kind).toBe('slice');
    if (result.kind !== 'slice') throw new Error('Expected exact slice.');
    expect(result.slice.content).toEqual([
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
    expect(data.getData('text/plain')).not.toContain('\uFEFF');
    expect(data.getData('text/html')).not.toContain('\uFEFF');
  });

  it('copies a fully selected void with its reachable root payload', () => {
    const figure = definePlugin('figure', {
      component: ({ attributes, children }) => (
        <figure {...attributes}>{children}</figure>
      ),
      schema: {
        element: {
          blockContent: true,
          contentRoots: {
            caption: {
              content: schema.content.type('paragraph', {
                default: { type: 'paragraph' },
                min: 1,
              }),
              ownership: 'exclusive',
            },
          },
          void: 'block',
        },
      },
    });
    const editor = createStaticEditor({
      initialValue: {
        children: [
          {
            childRoots: { caption: 'caption:1' },
            children: [{ text: '' }],
            type: 'figure',
          },
        ],
        roots: {
          'caption:1': [{ children: [{ text: 'Caption' }], type: 'paragraph' }],
        },
      },
      plugins: [figure],
    });
    const host = renderEditor(editor);
    const voidElement = host.querySelector('[data-editor-void="true"]')!;
    const range = document.createRange();

    range.selectNode(voidElement);
    document.getSelection()!.removeAllRanges();
    document.getSelection()!.addRange(range);
    const data = createDataTransfer();

    expect(writeStaticSelectionClipboardData(editor, data, host)).toBe(true);
    const result = editor.api.dom.clipboard.readSlice(data);

    expect(result.kind).toBe('slice');
    if (result.kind !== 'slice') throw new Error('Expected exact slice.');
    expect(result.slice.roots?.['caption:1']).toEqual([
      { children: [{ text: 'Caption' }], type: 'paragraph' },
    ]);
  });

  it('uses the selected iframe document', () => {
    const editor = createStaticEditor({
      initialValue: [{ children: [{ text: 'Frame' }], type: 'paragraph' }],
    });
    const iframe = document.createElement('iframe');

    document.body.append(iframe);
    Object.defineProperty(iframe.contentWindow!, 'SyntaxError', {
      configurable: true,
      value: SyntaxError,
    });
    const iframeDocument = iframe.contentDocument!;
    const host = renderEditor(editor, iframeDocument);
    const text = host.querySelector('[data-editor-string]')!.firstChild!;

    select(iframeDocument, text, 1, text, 4);
    const data = createDataTransfer();

    expect(writeStaticSelectionClipboardData(editor, data, host)).toBe(true);
    const result = editor.api.dom.clipboard.readSlice(data);

    expect(result.kind).toBe('slice');
    if (result.kind !== 'slice') throw new Error('Expected exact slice.');
    expect(NodeApi.string(result.slice.content[0])).toBe('ram');
  });

  it('declines stale coordinate markers', () => {
    const editor = createStaticEditor({
      initialValue: [{ children: [{ text: 'Alpha' }], type: 'paragraph' }],
    });
    const host = renderEditor(editor);
    const marker = host.querySelector<HTMLElement>('[data-editor-string]')!;

    marker.dataset.editorEnd = '4';
    select(document, marker.firstChild!, 0, marker.firstChild!, 4);

    expect(
      writeStaticSelectionClipboardData(editor, createDataTransfer(), host)
    ).toBe(false);
  });
});
