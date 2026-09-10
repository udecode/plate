import { fireEvent, render } from '@testing-library/react';
import React from 'react';

import {
  BaseParagraphPlugin,
  createEditor,
  defineBasePlugin,
  property,
  schema,
} from '../../core';
import { createDataTransfer } from '../../testing';
import { createStaticDocument } from '../document';
import { createStaticRenderers } from '../renderers';
import { getSelectedDomFragment } from '../utils/getSelectedDomFragment';
import { PlateStatic } from './PlateStatic';

describe('controlled static document', () => {
  afterEach(() => window.getSelection()?.removeAllRanges());

  it('does not render an unchanged independent block when the tail changes', () => {
    const rendered: string[] = [];
    const editor = createEditor({
      components: {
        paragraph: ({ attributes, children, element }) => {
          rendered.push(element.children[0].text as string);
          return <p {...attributes}>{children}</p>;
        },
      },
    });
    const retained = { type: 'paragraph', children: [{ text: 'retained' }] };
    const view = render(
      <PlateStatic
        editor={editor}
        value={{
          children: [
            retained,
            { type: 'paragraph', children: [{ text: 'before' }] },
          ],
        }}
      />
    );
    rendered.length = 0;
    view.rerender(
      <PlateStatic
        editor={editor}
        value={{
          children: [
            retained,
            { type: 'paragraph', children: [{ text: 'after' }] },
          ],
        }}
      />
    );
    expect(rendered).toEqual(['after']);
    expect(view.getByText('retained')).toBeTruthy();
  });

  it('refreshes retained nodes whose renderer reads another block', () => {
    const editor = createEditor({
      components: {
        paragraph: ({ attributes, children, document }) => (
          <p
            {...attributes}
            data-other={document.nodes.get([1])?.[0].children[0].text}
          >
            {children}
          </p>
        ),
      },
    });
    const retained = { type: 'paragraph', children: [{ text: 'retained' }] };
    const value = {
      children: [
        retained,
        { type: 'paragraph', children: [{ text: 'before' }] },
      ],
    };
    const view = render(<PlateStatic editor={editor} value={value} />);
    expect(view.getByText('retained').closest('p')?.dataset.other).toBe(
      'before'
    );
    view.rerender(
      <PlateStatic
        editor={editor}
        value={{
          children: [
            retained,
            { type: 'paragraph', children: [{ text: 'after' }] },
          ],
        }}
      />
    );
    expect(view.getByText('retained').closest('p')?.dataset.other).toBe(
      'after'
    );
  });

  it('keeps heading anchors unique across static render instances', () => {
    const editor = createEditor({
      components: {
        paragraph: ({ attributes, children, document, path }) => (
          <p {...attributes} id={document.anchorId(path)}>
            {children}
          </p>
        ),
      },
    });
    const value = {
      children: [{ type: 'paragraph', children: [{ text: 'heading' }] }],
    };
    const view = render(
      <>
        <PlateStatic editor={editor} value={value} />
        <PlateStatic editor={editor} value={value} />
      </>
    );
    const ids = [...view.container.querySelectorAll('p')].map(
      (element) => element.id
    );
    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
  });

  it('uses explicit static presentation without executing live components or wrappers', () => {
    const liveRender = mock(() => {
      throw new Error('Live renderer reached');
    });
    const editor = createEditor({
      components: { paragraph: liveRender },
      plugins: [
        defineBasePlugin('liveWrapper', {
          render: {
            aboveEditable: liveRender,
            aboveNodes: liveRender,
            belowRootNodes: liveRender,
          },
        }),
      ],
      initialValue: {
        children: [{ type: 'paragraph', children: [{ text: 'original' }] }],
      },
    });
    const renderers = createStaticRenderers([
      BaseParagraphPlugin.configure({
        component: ({ attributes, children, document, path }) => (
          <p
            {...attributes}
            data-static-value={document.nodes.get(path)?.[0].children[0].text}
          >
            {children}
          </p>
        ),
      }),
    ]);
    const value = {
      children: [{ type: 'paragraph', children: [{ text: 'independent' }] }],
    };
    const view = render(
      <PlateStatic editor={editor} value={value} renderers={renderers} />
    );
    expect(
      view
        .getByText('independent')
        .closest('p')
        ?.getAttribute('data-static-value')
    ).toBe('independent');
    expect(liveRender).not.toHaveBeenCalled();
    expect(editor.read.children()[0].children[0].text).toBe('original');
  });

  it('uses draft nodes for custom reads and rich copy without changing the editor', () => {
    const original = { type: 'paragraph', children: [{ text: 'same words' }] };
    const value = {
      children: [
        { type: 'paragraph', children: [{ bold: true, text: 'same words' }] },
      ],
    };
    const editor = createEditor({
      plugins: [
        defineBasePlugin('bold', { schema: { mark: property.boolean() } }),
      ],
      initialValue: { children: [original] },
      components: {
        paragraph: ({ attributes, children, document, path }) => (
          <p
            {...attributes}
            data-read-bold={String(
              document.nodes.get(path)?.[0].children[0].bold === true
            )}
          >
            {children}
          </p>
        ),
        bold: ({ attributes, children }) => (
          <strong {...attributes}>{children}</strong>
        ),
      },
    });
    const before = editor.read.value();
    const onCommit = mock();
    const unsubscribe = editor.subscribe(onCommit);
    const view = render(<PlateStatic editor={editor} value={value} />);
    expect(view.container.querySelector('strong')?.textContent).toBe(
      'same words'
    );
    expect(view.container.querySelector('p')?.dataset.readBold).toBe('true');
    view.rerender(
      <PlateStatic
        editor={editor}
        value={{
          children: [{ type: 'paragraph', children: [{ text: 'updated' }] }],
        }}
      />
    );
    expect(view.getByText('updated').closest('p')?.dataset.readBold).toBe(
      'false'
    );
    view.rerender(<PlateStatic editor={editor} value={value} />);

    const element = view.container.querySelector<HTMLElement>(
      '[data-plite-editor]'
    )!;
    const range = window.document.createRange();
    range.selectNode(view.container.querySelector('p')!);
    window.getSelection()!.addRange(range);
    const document = createStaticDocument(value, editor.read.schema);
    expect(getSelectedDomFragment(editor, { document, element })).toEqual(
      value.children
    );
    const data = createDataTransfer();
    fireEvent.copy(element, { clipboardData: data });
    expect(data.getData('application/x-plite-fragment')).not.toBe('');
    expect(data.getData('text/html')).toContain('<strong');
    expect(editor.read.value()).toEqual(before);
    expect(onCommit).not.toHaveBeenCalled();
    unsubscribe();
  });

  it('owns native copy focus and extracts a partial marked range from the static document', () => {
    const editor = createEditor({
      initialValue: [
        { type: 'paragraph', children: [{ text: 'canonical original' }] },
      ],
      plugins: [
        defineBasePlugin('bold', { schema: { mark: property.boolean() } }),
        defineBasePlugin('italic', { schema: { mark: property.boolean() } }),
      ],
      components: {
        bold: ({ attributes, children }) => (
          <strong {...attributes}>{children}</strong>
        ),
        italic: ({ attributes, children }) => (
          <em {...attributes}>{children}</em>
        ),
      },
    });
    const value = {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'copied', bold: true },
            { text: ' ' },
            { text: 'italic', italic: true },
          ],
        },
      ],
    };
    const before = editor.read.value();
    const commits = mock();
    const unsubscribe = editor.subscribe(commits);
    const view = render(
      <div contentEditable suppressContentEditableWarning>
        <PlateStatic editor={editor} value={value} />
      </div>
    );
    const element = view.container.querySelector<HTMLElement>(
      '[data-plite-node="value"]'
    )!;
    const strong = view.container.querySelector('strong')!;
    fireEvent.pointerDown(strong);
    expect(window.document.activeElement).toBe(element);
    const range = window.document.createRange();
    range.setStart(strong.firstChild!.firstChild!, 1);
    range.setEnd(
      view.container.querySelector('em')!.firstChild!.firstChild!,
      6
    );
    window.getSelection()!.addRange(range);
    expect(
      getSelectedDomFragment(editor, {
        document: createStaticDocument(value, editor.read.schema),
        element,
      })
    ).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'opied', bold: true },
          { text: ' ' },
          { text: 'italic', italic: true },
        ],
      },
    ]);
    const data = createDataTransfer();
    fireEvent.copy(window.document.activeElement!, { clipboardData: data });
    expect(data.getData('text/plain')).toBe('opied italic');
    expect(data.getData('text/html')).toContain('<strong');
    expect(data.getData('text/html')).toContain('<em');
    expect(editor.read.value()).toEqual(before);
    expect(commits).not.toHaveBeenCalled();
    unsubscribe();
  });

  it('reads named roots from the rendered value and rejects copy across static boundaries', () => {
    const editor = createEditor({
      plugins: [
        defineBasePlugin('figure', {
          schema: {
            element: {
              contentRoots: {
                caption: {
                  content: schema.content.type('paragraph', {
                    default: { type: 'paragraph' },
                    min: 1,
                  }),
                  ownership: 'exclusive',
                },
              },
              blockContent: true,
              void: 'block',
            },
          },
        }),
      ],
      initialValue: {
        children: [
          {
            type: 'figure',
            children: [{ text: '' }],
            childRoots: { caption: 'caption:1' },
          },
        ],
        roots: {
          'caption:1': [
            { type: 'paragraph', children: [{ text: 'original' }] },
          ],
        },
      },
      components: {
        figure: ({ attributes, slots }) => (
          <figure {...attributes}>{slots.contentRoot('caption')}</figure>
        ),
        paragraph: ({ attributes, document, path }) => (
          <p {...attributes}>
            {document.nodes.get(path)?.[0].children[0].text}
          </p>
        ),
      },
    });
    const value = {
      ...editor.read.value(),
      roots: {
        'caption:1': [
          { type: 'paragraph', children: [{ text: 'draft caption' }] },
        ],
      },
    };
    const before = editor.read.value();
    const view = render(
      <>
        <PlateStatic editor={editor} value={value} />
        <span>outside</span>
      </>
    );
    expect(view.getByText('draft caption')).toBeTruthy();
    const element = view.container.querySelector<HTMLElement>(
      '[data-plite-editor]'
    )!;
    const range = window.document.createRange();
    range.selectNode(view.getByText('draft caption'));
    window.getSelection()!.addRange(range);
    const document = createStaticDocument(value, editor.read.schema);
    expect(getSelectedDomFragment(editor, { document, element })).toEqual(
      value.roots['caption:1']
    );
    range.setEndAfter(view.getByText('outside'));
    expect(getSelectedDomFragment(editor, { document, element })).toEqual([]);
    expect(editor.read.value()).toEqual(before);
  });
});
