import { BoldPlugin } from '../../../marks/bold/BoldPlugin';
import { CodePlugin } from '../../../marks/code/CodePlugin';
import { HighlightPlugin } from '../../../marks/highlight/HighlightPlugin';
import { ItalicPlugin } from '../../../marks/italic/ItalicPlugin';
import { KbdPlugin } from '../../../marks/kbd/KbdPlugin';
import { StrikethroughPlugin } from '../../../marks/strikethrough/StrikethroughPlugin';
import { SubscriptPlugin } from '../../../marks/subsupscript/subscript/SubscriptPlugin';
import { SuperscriptPlugin } from '../../../marks/subsupscript/superscript/SuperscriptPlugin';
import { UnderlinePlugin } from '../../../marks/underline/UnderlinePlugin';
import { serializeHTMLFromNodes } from '../serializeHTMLFromNodes';
import { htmlStringToDOMNode } from '../utils/htmlStringToDOMNode';

it('serialize bold to html', () => {
  expect(
    serializeHTMLFromNodes([BoldPlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'bold', bold: true },
      { text: ' part.' },
    ])
  ).toEqual(
    'Some paragraph of text with <strong class="slate-bold">bold</strong> part.'
  );
});

it('serialize italic to html', () => {
  expect(
    serializeHTMLFromNodes([ItalicPlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'italic', italic: true },
      { text: ' part.' },
    ])
  ).toEqual(
    'Some paragraph of text with <em class="slate-italic">italic</em> part.'
  );
});

it('serialize highlight to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHTMLFromNodes([HighlightPlugin()])([
        { text: 'Some paragraph of text with ' },
        { text: 'highlighted', highlight: true },
        { text: ' part.' },
      ])
    ).getElementsByTagName('mark')[0].textContent
  ).toEqual('highlighted');
});

it('serialize strikethrough to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHTMLFromNodes([StrikethroughPlugin()])([
        { text: 'Some paragraph of text with ' },
        { text: 'strikethrough', strikethrough: true },
        { text: ' part.' },
      ])
    ).getElementsByClassName('slate-strikethrough')[0].textContent
  ).toEqual('strikethrough');
});

it('serialize code to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHTMLFromNodes([CodePlugin()])([
        { text: 'Some paragraph of text with ' },
        { text: 'some code', code: true },
        { text: ' part.' },
      ])
    ).getElementsByTagName('code')[0].textContent
  ).toEqual('some code');
});

it('serialize kbd to html', () => {
  expect(
    htmlStringToDOMNode(
      serializeHTMLFromNodes([KbdPlugin()])([
        { text: 'Some paragraph of text with ' },
        { text: 'keyboard shortcut', kbd: true },
        { text: ' part.' },
      ])
    ).getElementsByTagName('kbd')[0].textContent
  ).toEqual('keyboard shortcut');
});

it('serialize subscript to html', () => {
  expect(
    serializeHTMLFromNodes([SubscriptPlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'subscripted', subscript: true },
      { text: ' part.' },
    ])
  ).toEqual(
    'Some paragraph of text with <sub class="slate-subscript">subscripted</sub> part.'
  );
});

it('serialize superscript to html', () => {
  expect(
    serializeHTMLFromNodes([SuperscriptPlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'superscripted', superscript: true },
      { text: ' part.' },
    ])
  ).toEqual(
    'Some paragraph of text with <sup class="slate-superscript">superscripted</sup> part.'
  );
});

it('serialize underline to html', () => {
  expect(
    serializeHTMLFromNodes([UnderlinePlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'underlined', underline: true },
      { text: ' part.' },
    ])
  ).toEqual(
    'Some paragraph of text with <u class="slate-underline">underlined</u> part.'
  );
});

it('serialize bold and italic together to html', () => {
  expect(
    serializeHTMLFromNodes([BoldPlugin(), ItalicPlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'bold', bold: true, italic: true },
      { text: ' part.' },
    ])
  ).toEqual(
    'Some paragraph of text with <em class="slate-italic"><strong class="slate-bold">bold</strong></em> part.'
  );
});

it('serialize bold and superscript together to html', () => {
  expect(
    serializeHTMLFromNodes([BoldPlugin(), SuperscriptPlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'bold', bold: true, superscript: true },
      { text: ' part.' },
    ])
  ).toEqual(
    'Some paragraph of text with <sup class="slate-superscript"><strong class="slate-bold">bold</strong></sup> part.'
  );
});

it('serialize bold italic and underline together to html', () => {
  expect(
    serializeHTMLFromNodes([BoldPlugin(), ItalicPlugin(), UnderlinePlugin()])([
      { text: 'Some paragraph of text with ' },
      { text: 'bold', bold: true, italic: true, underline: true },
      { text: ' part.' },
    ])
  ).toEqual(
    'Some paragraph of text with <u class="slate-underline"><em class="slate-italic"><strong class="slate-bold">bold</strong></em></u> part.'
  );
});
