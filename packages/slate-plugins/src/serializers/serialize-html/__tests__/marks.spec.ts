import { useBoldPlugin } from '../../../marks/bold/useBoldPlugin';
import { useCodePlugin } from '../../../marks/code/useCodePlugin';
import { useHighlightPlugin } from '../../../marks/highlight/useHighlightPlugin';
import { useItalicPlugin } from '../../../marks/italic/useItalicPlugin';
import { useKbdPlugin } from '../../../marks/kbd/useKbdPlugin';
import { useStrikethroughPlugin } from '../../../marks/strikethrough/useStrikethroughPlugin';
import { useSubscriptPlugin } from '../../../marks/subsupscript/subscript/useSubscriptPlugin';
import { useSuperscriptPlugin } from '../../../marks/subsupscript/superscript/useSuperscriptPlugin';
import { useUnderlinePlugin } from '../../../marks/underline/useUnderlinePlugin';
import { serializeHTMLFromNodes } from '../serializeHTMLFromNodes';
import { htmlStringToDOMNode } from '../utils/htmlStringToDOMNode';

it('serialize bold to html', () => {
  expect(
    serializeHTMLFromNodes({
      plugins: [useBoldPlugin()],
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
    serializeHTMLFromNodes({
      plugins: [useItalicPlugin()],
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
      serializeHTMLFromNodes({
        plugins: [useHighlightPlugin()],
        nodes: [
          { text: 'Some paragraph of text with ' },
          { text: 'highlighted', highlight: true },
          { text: ' part.' },
        ],
      })
    ).getElementsByTagName('mark')[0].textContent
  ).toEqual('highlighted');
});

it('serialize strikethrough to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHTMLFromNodes({
        plugins: [useStrikethroughPlugin()],
        nodes: [
          { text: 'Some paragraph of text with ' },
          { text: 'strikethrough', strikethrough: true },
          { text: ' part.' },
        ],
      })
    ).getElementsByClassName('slate-strikethrough')[0].textContent
  ).toEqual('strikethrough');
});

it('serialize code to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHTMLFromNodes({
        plugins: [useCodePlugin()],
        nodes: [
          { text: 'Some paragraph of text with ' },
          { text: 'some code', code: true },
          { text: ' part.' },
        ],
      })
    ).getElementsByTagName('code')[0].textContent
  ).toEqual('some code');
});

it('serialize kbd to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHTMLFromNodes({
        plugins: [useKbdPlugin()],
        nodes: [
          { text: 'Some paragraph of text with ' },
          { text: 'keyboard shortcut', kbd: true },
          { text: ' part.' },
        ],
      })
    ).getElementsByTagName('kbd')[0].textContent
  ).toEqual('keyboard shortcut');
});

it('serialize subscript to html', () => {
  expect(
    serializeHTMLFromNodes({
      plugins: [useSubscriptPlugin()],
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
    serializeHTMLFromNodes({
      plugins: [useSuperscriptPlugin()],
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
    serializeHTMLFromNodes({
      plugins: [useUnderlinePlugin()],
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
    serializeHTMLFromNodes({
      plugins: [useBoldPlugin(), useItalicPlugin()],
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
    serializeHTMLFromNodes({
      plugins: [useBoldPlugin(), useSuperscriptPlugin()],
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
    serializeHTMLFromNodes({
      plugins: [useBoldPlugin(), useItalicPlugin(), useUnderlinePlugin()],
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
