import { BasicMarksPlugin } from '@udecode/plate-basic-marks';
import { htmlStringToDOMNode } from '@udecode/plate-core';
import { HighlightPlugin } from '@udecode/plate-highlight';
import { KbdPlugin } from '@udecode/plate-kbd';

import { serializeHtml } from '../../react/serializeHtml';
import { createPlateUIEditor } from '../create-plate-ui-editor';

const plugins = [BasicMarksPlugin, HighlightPlugin, KbdPlugin];
const editor = createPlateUIEditor({ plugins });

it('serialize bold to html', () => {
  expect(
    serializeHtml(editor, {
      nodes: [
        { text: 'Some paragraph of text with ' },
        { bold: true, text: 'bold' },
        { text: ' part.' },
      ],
    })
  ).toEqual(
    'Some paragraph of text with <strong class="slate-bold">bold</strong> part.'
  );
});

it('serialize italic to html', () => {
  expect(
    serializeHtml(editor, {
      nodes: [
        { text: 'Some paragraph of text with ' },
        { italic: true, text: 'italic' },
        { text: ' part.' },
      ],
    })
  ).toEqual(
    'Some paragraph of text with <em class="slate-italic">italic</em> part.'
  );
});

it('serialize highlight to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHtml(editor, {
        nodes: [
          { text: 'Some paragraph of text with ' },
          { highlight: true, text: 'highlighted' },
          { text: ' part.' },
        ],
      })
    ).querySelectorAll('mark')[0]
  ).toHaveTextContent('highlighted');
});

it('serialize strikethrough to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHtml(editor, {
        nodes: [
          { text: 'Some paragraph of text with ' },
          { strikethrough: true, text: 'strikethrough' },
          { text: ' part.' },
        ],
      })
    ).querySelectorAll('.slate-strikethrough')[0]
  ).toHaveTextContent('strikethrough');
});

it('serialize code to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHtml(editor, {
        nodes: [
          { text: 'Some paragraph of text with ' },
          { code: true, text: 'some code' },
          { text: ' part.' },
        ],
      })
    ).querySelectorAll('code')[0]
  ).toHaveTextContent('some code');
});

it('serialize kbd to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHtml(editor, {
        nodes: [
          { text: 'Some paragraph of text with ' },
          { kbd: true, text: 'keyboard shortcut' },
          { text: ' part.' },
        ],
      })
    ).querySelectorAll('kbd')[0]
  ).toHaveTextContent('keyboard shortcut');
});

it('serialize subscript to html', () => {
  expect(
    serializeHtml(editor, {
      nodes: [
        { text: 'Some paragraph of text with ' },
        { subscript: true, text: 'subscripted' },
        { text: ' part.' },
      ],
    })
  ).toEqual(
    'Some paragraph of text with <sub class="slate-subscript">subscripted</sub> part.'
  );
});

it('serialize superscript to html', () => {
  expect(
    serializeHtml(editor, {
      nodes: [
        { text: 'Some paragraph of text with ' },
        { superscript: true, text: 'superscripted' },
        { text: ' part.' },
      ],
    })
  ).toEqual(
    'Some paragraph of text with <sup class="slate-superscript">superscripted</sup> part.'
  );
});

it('serialize underline to html', () => {
  expect(
    serializeHtml(editor, {
      nodes: [
        { text: 'Some paragraph of text with ' },
        { text: 'underlined', underline: true },
        { text: ' part.' },
      ],
    })
  ).toEqual(
    'Some paragraph of text with <u class="slate-underline">underlined</u> part.'
  );
});

it('serialize bold and italic together to html', () => {
  expect(
    serializeHtml(editor, {
      nodes: [
        { text: 'Some paragraph of text with ' },
        { bold: true, italic: true, text: 'bold' },
        { text: ' part.' },
      ],
    })
  ).toEqual(
    'Some paragraph of text with <em class="slate-italic"><strong class="slate-bold">bold</strong></em> part.'
  );
});

it('serialize bold and superscript together to html', () => {
  expect(
    serializeHtml(editor, {
      nodes: [
        { text: 'Some paragraph of text with ' },
        { bold: true, superscript: true, text: 'bold' },
        { text: ' part.' },
      ],
    })
  ).toEqual(
    'Some paragraph of text with <sup class="slate-superscript"><strong class="slate-bold">bold</strong></sup> part.'
  );
});

it('serialize bold italic and underline together to html', () => {
  expect(
    serializeHtml(editor, {
      nodes: [
        { text: 'Some paragraph of text with ' },
        { bold: true, italic: true, text: 'bold', underline: true },
        { text: ' part.' },
      ],
    })
  ).toEqual(
    'Some paragraph of text with <u class="slate-underline"><em class="slate-italic"><strong class="slate-bold">bold</strong></em></u> part.'
  );
});
