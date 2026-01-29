import plusIconSvg from '@harbour-enterprises/common/icons/plus-solid.svg?raw';
import trashIconSvg from '@harbour-enterprises/common/icons/trash-can-solid.svg?raw';
import wrenchIconSvg from '@harbour-enterprises/common/icons/wrench-solid.svg?raw';
import borderNoneIconSvg from '@harbour-enterprises/common/icons/border-none-solid.svg?raw';
import arrowsLeftRightIconSvg from '@harbour-enterprises/common/icons/arrows-left-right-solid.svg?raw';
import arrowsToDotIconSvg from '@harbour-enterprises/common/icons/arrows-to-dot-solid.svg?raw';
import magicWandIcon from '@harbour-enterprises/common/icons/magic-wand-solid.svg?raw';
import linkIconSvg from '@harbour-enterprises/common/icons/link-solid.svg?raw';
import tableIconSvg from '@harbour-enterprises/common/icons/table-solid.svg?raw';
import scissorsIconSvg from '@harbour-enterprises/common/icons/scissors-solid.svg?raw';
import copyIconSvg from '@harbour-enterprises/common/icons/copy-solid.svg?raw';
import pasteIconSvg from '@harbour-enterprises/common/icons/paste-solid.svg?raw';

export const ICONS = {
  addRowBefore: plusIconSvg,
  addRowAfter: plusIconSvg,
  addColumnBefore: plusIconSvg,
  addColumnAfter: plusIconSvg,
  deleteRow: trashIconSvg,
  deleteColumn: trashIconSvg,
  deleteTable: trashIconSvg,
  deleteBorders: borderNoneIconSvg,
  mergeCells: arrowsToDotIconSvg,
  splitCell: arrowsLeftRightIconSvg,
  fixTables: wrenchIconSvg,
  ai: magicWandIcon,
  link: linkIconSvg,
  table: tableIconSvg,
  cut: scissorsIconSvg,
  copy: copyIconSvg,
  paste: pasteIconSvg,
  addDocumentSection: plusIconSvg,
  removeDocumentSection: trashIconSvg,
};

// Table actions constant
export const TEXTS = {
  addRowBefore: 'Insert row above',
  addRowAfter: 'Insert row below',
  addColumnBefore: 'Insert column left',
  addColumnAfter: 'Insert column right',
  deleteRow: 'Delete row',
  deleteColumn: 'Delete column',
  deleteTable: 'Delete table',
  transparentBorders: 'Transparent borders',
  mergeCells: 'Merge cells',
  splitCell: 'Split cell',
  fixTables: 'Fix tables',
  insertText: 'Insert text',
  replaceText: 'Replace text',
  insertLink: 'Insert link',
  insertTable: 'Insert table',
  editTable: 'Edit table',
  cut: 'Cut',
  copy: 'Copy',
  paste: 'Paste',
  removeDocumentSection: 'Remove section',
  createDocumentSection: 'Create section',
};

export const tableActionsOptions = [
  {
    label: TEXTS.addRowBefore,
    command: 'addRowBefore',
    icon: ICONS.addRowBefore,
    props: {
      'data-item': 'btn-tableActions-option',
      ariaLabel: 'Add row before',
    },
  },
  {
    label: TEXTS.addRowAfter,
    command: 'addRowAfter',
    icon: ICONS.addRowAfter,
    props: {
      'data-item': 'btn-tableActions-option',
      ariaLabel: 'Add row after',
    },
  },
  {
    label: TEXTS.addColumnBefore,
    command: 'addColumnBefore',
    icon: ICONS.addColumnBefore,
    props: {
      'data-item': 'btn-tableActions-option',
      ariaLabel: 'Add column before',
    },
  },
  {
    label: TEXTS.addColumnAfter,
    command: 'addColumnAfter',
    icon: ICONS.addColumnAfter,
    bottomBorder: true,
    props: {
      'data-item': 'btn-tableActions-option',
      ariaLabel: 'Add column after',
    },
  },
  {
    label: TEXTS.deleteRow,
    command: 'deleteRow',
    icon: ICONS.deleteRow,
    props: {
      'data-item': 'btn-tableActions-option',
      ariaLabel: 'Delete row',
    },
  },
  {
    label: TEXTS.deleteColumn,
    command: 'deleteColumn',
    icon: ICONS.deleteColumn,
    props: {
      'data-item': 'btn-tableActions-option',
      ariaLabel: 'Delete column',
    },
  },
  {
    label: TEXTS.deleteTable,
    command: 'deleteTable',
    icon: ICONS.deleteTable,
    props: {
      'data-item': 'btn-tableActions-option',
      ariaLabel: 'Delete table',
    },
  },
  {
    label: TEXTS.transparentBorders,
    command: 'deleteCellAndTableBorders',
    icon: ICONS.deleteBorders,
    bottomBorder: true,
    props: {
      'data-item': 'btn-tableActions-option',
      ariaLabel: 'Delete cell and table borders',
    },
  },
  {
    label: TEXTS.mergeCells,
    command: 'mergeCells',
    icon: ICONS.mergeCells,
    props: {
      'data-item': 'btn-tableActions-option',
      ariaLabel: 'Merge cells',
    },
  },
  {
    label: TEXTS.splitCell,
    command: 'splitCell',
    icon: ICONS.splitCell,
    props: {
      'data-item': 'btn-tableActions-option',
      ariaLabel: 'Split cells',
    },
  },
  {
    label: TEXTS.fixTables,
    command: 'fixTables',
    icon: ICONS.fixTables,
    props: {
      'data-item': 'btn-tableActions-option',
      ariaLabel: 'Fix tables',
    },
  },
];

export const TRIGGERS = {
  slash: 'slash',
  click: 'click',
};
