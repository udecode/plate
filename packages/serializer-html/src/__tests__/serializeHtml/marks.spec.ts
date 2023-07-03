import { createBasicMarksPlugin } from '@/packages/basic-marks/src/createBasicMarksPlugin';
import { createHighlightPlugin } from '@/packages/highlight/src/createHighlightPlugin';
import { createKbdPlugin } from '@/packages/kbd/src/createKbdPlugin';
import { serializeHtml } from '@/packages/serializer-html/src/serializeHtml';
import { createPlateUIEditor } from '@/plate/create-plate-ui-editor';
import { htmlStringToDOMNode } from '@udecode/plate-core';

const plugins = [
  createBasicMarksPlugin(),
  createHighlightPlugin(),
  createKbdPlugin(),
];
const editor = createPlateUIEditor({ plugins });

it('serialize bold to html', () => {
  expect(
    serializeHtml(editor, {
      nodes: [
        { text: 'Some paragraph of text with ' },
        { text: 'bold', bold: true },
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
        { text: 'italic', italic: true },
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
          { text: 'highlighted', highlight: true },
          { text: ' part.' },
        ],
      })
    ).querySelectorAll('mark')[0].textContent
  ).toEqual('highlighted');
});

it('serialize strikethrough to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHtml(editor, {
        nodes: [
          { text: 'Some paragraph of text with ' },
          { text: 'strikethrough', strikethrough: true },
          { text: ' part.' },
        ],
      })
    ).querySelectorAll('.slate-strikethrough')[0].textContent
  ).toEqual('strikethrough');
});

it('serialize code to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHtml(editor, {
        nodes: [
          { text: 'Some paragraph of text with ' },
          { text: 'some code', code: true },
          { text: ' part.' },
        ],
      })
    ).querySelectorAll('code')[0].textContent
  ).toEqual('some code');
});

it('serialize kbd to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHtml(editor, {
        nodes: [
          { text: 'Some paragraph of text with ' },
          { text: 'keyboard shortcut', kbd: true },
          { text: ' part.' },
        ],
      })
    ).querySelectorAll('kbd')[0].textContent
  ).toEqual('keyboard shortcut');
});

it('serialize subscript to html', () => {
  expect(
    serializeHtml(editor, {
      nodes: [
        { text: 'Some paragraph of text with ' },
        { text: 'subscripted', subscript: true },
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
        { text: 'superscripted', superscript: true },
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
        { text: 'bold', bold: true, italic: true },
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
        { text: 'bold', bold: true, superscript: true },
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
        { text: 'bold', bold: true, italic: true, underline: true },
        { text: ' part.' },
      ],
    })
  ).toEqual(
    'Some paragraph of text with <u class="slate-underline"><em class="slate-italic"><strong class="slate-bold">bold</strong></em></u> part.'
  );
});
