import {
  AutoformatRule,
  MARK_BOLD,
  MARK_CODE,
  MARK_HIGHLIGHT,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
} from '@udecode/plate';

export const autoformatMarks: AutoformatRule[] = [
  {
    type: [MARK_BOLD, MARK_ITALIC],
    markup: '***',
    mode: 'mark',
  },
  {
    type: [MARK_UNDERLINE, MARK_ITALIC],
    markup: ['__*', '*__'],
    mode: 'mark',
  },
  {
    type: [MARK_UNDERLINE, MARK_BOLD],
    markup: ['__**', '**__'],
    mode: 'mark',
  },
  {
    type: [MARK_UNDERLINE, MARK_BOLD, MARK_ITALIC],
    markup: ['___***', '***___'],
    // trigger: '_',
    mode: 'mark',
  },
  {
    type: MARK_BOLD,
    markup: '**',
    mode: 'mark',
  },
  {
    type: MARK_UNDERLINE,
    markup: '__',
    mode: 'mark',
  },
  {
    type: MARK_ITALIC,
    markup: '*',
    mode: 'mark',
  },
  {
    type: MARK_ITALIC,
    markup: '_',
    mode: 'mark',
  },
  {
    type: MARK_STRIKETHROUGH,
    markup: '~~',
    mode: 'mark',
  },
  {
    type: MARK_SUPERSCRIPT,
    markup: '^',
    mode: 'mark',
  },
  {
    type: MARK_SUBSCRIPT,
    markup: '~',
    mode: 'mark',
  },
  {
    type: MARK_HIGHLIGHT,
    markup: '==',
    mode: 'mark',
  },
  {
    type: MARK_HIGHLIGHT,
    markup: '≡',
    mode: 'mark',
  },
  {
    type: MARK_CODE,
    markup: '`',
    mode: 'mark',
  },
];
