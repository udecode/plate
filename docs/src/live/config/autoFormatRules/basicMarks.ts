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

export const basicMarks: AutoformatRule[] = [
  {
    type: MARK_BOLD,
    between: ['**', '**'],
    mode: 'inline',
    insertTrigger: true,
  },
  {
    type: MARK_UNDERLINE,
    between: ['__', '__'],
    mode: 'inline',
    insertTrigger: true,
  },
  {
    type: MARK_ITALIC,
    between: ['*', '*'],
    mode: 'inline',
    insertTrigger: true,
  },
  {
    type: MARK_ITALIC,
    between: ['_', '_'],
    mode: 'inline',
    insertTrigger: true,
  },
  // {
  //   type: [MARK_BOLD, MARK_ITALIC],
  //   between: ["***", "***"],
  //   mode: "inline",
  //   insertTrigger: true
  // },
  // {
  //   type: [MARK_UNDERLINE, MARK_ITALIC],
  //   between: ["__*", "*__"],
  //   mode: "inline",
  //   insertTrigger: true
  // },
  // {
  //   type: [MARK_UNDERLINE, MARK_BOLD],
  //   between: ["__**", "**__"],
  //   mode: "inline",
  //   insertTrigger: true
  // },
  // {
  //   type: [MARK_UNDERLINE, MARK_BOLD, MARK_ITALIC],
  //   between: ["__***", "***__"],
  //   mode: "inline",
  //   insertTrigger: true
  // },
  {
    type: MARK_STRIKETHROUGH,
    between: ['~~', '~~'],
    mode: 'inline',
    insertTrigger: true,
  },
  {
    type: MARK_SUPERSCRIPT,
    between: ['^', '^'],
    mode: 'inline',
    insertTrigger: false,
  },
  {
    type: MARK_SUBSCRIPT,
    between: ['~', '~'],
    mode: 'inline',
    insertTrigger: false,
  },
  {
    type: MARK_HIGHLIGHT,
    between: ['==', '=='],
    mode: 'inline',
    insertTrigger: true,
  },
  {
    type: MARK_HIGHLIGHT,
    between: ['≡', '≡'],
    mode: 'inline',
    insertTrigger: true,
  },
  {
    type: MARK_CODE,
    between: ['`', '`'],
    mode: 'inline',
    insertTrigger: true,
  },
];
