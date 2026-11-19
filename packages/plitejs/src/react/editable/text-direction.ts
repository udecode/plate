import { type Descendant, type Element, NodeApi } from '../..';
import {
  type AnyEditor,
  isInline as editorIsInline,
  isVoid as editorIsVoid,
} from './runtime-editor-api';

export type TextDirection = 'ltr' | 'neutral' | 'rtl';

const LETTER_MATCHER = /\p{L}/u;
const SHARED_MODIFIER_MATCHER = /(?=\p{Lm})[\p{scx=Zyyy}\p{scx=Zinh}]/u;
const MARK_DIRECTIONS: Readonly<Record<string, TextDirection>> = {
  '\u061C': 'rtl',
  '\u200E': 'ltr',
  '\u200F': 'rtl',
};

// An engine whose Unicode data lacks a script rejects its name, so the
// matcher keeps only the scripts that compile.
export const RTL_SCRIPT_MATCHER = new RegExp(
  `[${[
    'Adlam',
    'Arabic',
    'Avestan',
    'Chorasmian',
    'Cypriot',
    'Elymaic',
    'Garay',
    'Hanifi_Rohingya',
    'Hatran',
    'Hebrew',
    'Imperial_Aramaic',
    'Inscriptional_Pahlavi',
    'Inscriptional_Parthian',
    'Kharoshthi',
    'Lydian',
    'Mandaic',
    'Manichaean',
    'Mende_Kikakui',
    'Meroitic_Cursive',
    'Meroitic_Hieroglyphs',
    'Nabataean',
    'Nko',
    'Old_Hungarian',
    'Old_North_Arabian',
    'Old_Sogdian',
    'Old_South_Arabian',
    'Old_Turkic',
    'Old_Uyghur',
    'Palmyrene',
    'Phoenician',
    'Psalter_Pahlavi',
    'Samaritan',
    'Sogdian',
    'Syriac',
    'Thaana',
    'Yezidi',
  ]
    .flatMap((script) => {
      try {
        return [new RegExp(`\\p{Script_Extensions=${script}}`, 'u').source];
      } catch {
        return [];
      }
    })
    .join('')}]`,
  'u'
);

export const getTextDirection = (value: string): TextDirection => {
  for (const character of value) {
    const mark = MARK_DIRECTIONS[character];

    if (mark) return mark;
    if (!LETTER_MATCHER.test(character)) continue;
    if (RTL_SCRIPT_MATCHER.test(character)) return 'rtl';
    if (!SHARED_MODIFIER_MATCHER.test(character)) return 'ltr';
  }

  return 'neutral';
};

const getChildrenDirection = (
  children: readonly Descendant[]
): TextDirection => {
  for (const child of children) {
    const direction = NodeApi.isText(child)
      ? getTextDirection(child.text)
      : getChildrenDirection(child.children);

    if (direction !== 'neutral') return direction;
  }

  return 'neutral';
};

const isTextBlock = (editor: AnyEditor, element: Element) => {
  const [first] = element.children;

  return (
    !!first &&
    (NodeApi.isText(first) || editorIsInline(editor, first)) &&
    !editorIsInline(editor, element) &&
    !editorIsVoid(editor, element)
  );
};

export const getTextBlockDirection = (
  editor: AnyEditor,
  element: Element
): 'ltr' | 'rtl' | undefined => {
  if (!isTextBlock(editor, element)) return undefined;

  const direction = getChildrenDirection(element.children);

  return direction === 'neutral' ? undefined : direction;
};
