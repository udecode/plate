import type { Value } from 'platejs';

export const lockValue: Value = [
  {
    children: [{ text: 'Service Agreement' }],
    level: 2,
    type: 'heading',
  },
  {
    children: [
      {
        text: 'Editable intro: update project notes here, or drag this block above or below a locked clause.',
      },
    ],
    type: 'paragraph',
  },
  {
    children: [
      {
        text: 'Locked confidentiality clause: ',
      },
      {
        children: [{ text: '' }],
        fieldId: 'party-name',
        kind: 'text',
        label: 'Counterparty',
        name: 'party_name',
        required: true,
        role: 'signer',
        type: 'field',
      },
      {
        text: ' agrees to keep project terms confidential starting ',
      },
      {
        children: [{ text: '' }],
        fieldId: 'effective-date',
        kind: 'date',
        label: 'Effective date',
        name: 'effective_date',
        role: 'signer',
        type: 'field',
      },
      {
        text: '. Inline fields stay fillable while the clause text stays protected, selectable, and copyable.',
      },
    ],
    locked: true,
    type: 'paragraph',
  },
  {
    children: [
      {
        children: [
          {
            text: 'Locked blockquote: child blocks inherit the lock from their parent container. Unlock the blockquote from its handle or context menu to edit inside.',
          },
        ],
        type: 'paragraph',
      },
    ],
    locked: true,
    type: 'blockquote',
  },
  {
    children: [
      {
        text: 'Editable notes: try copying text from a locked clause and pasting here, pressing Enter at the start or end of a locked block, or selecting across locked clauses and clicking Ask AI.',
      },
    ],
    type: 'paragraph',
  },
  {
    children: [
      {
        children: [
          {
            children: [
              { children: [{ bold: true, text: 'Item' }], type: 'paragraph' },
            ],
            header: true,
            type: 'tableCell',
          },
          {
            children: [
              {
                children: [{ bold: true, text: 'Fee (Locked)' }],
                type: 'paragraph',
              },
            ],
            header: true,
            type: 'tableCell',
          },
          {
            children: [
              {
                children: [{ bold: true, text: 'Delivery Notes' }],
                type: 'paragraph',
              },
            ],
            header: true,
            type: 'tableCell',
          },
        ],
        type: 'tableRow',
      },
      {
        children: [
          {
            children: [
              { children: [{ text: 'Base retainer' }], type: 'paragraph' },
            ],
            locked: true,
            type: 'tableCell',
          },
          {
            children: [
              { children: [{ text: '$12,000 (Net 15)' }], type: 'paragraph' },
            ],
            locked: true,
            type: 'tableCell',
          },
          {
            children: [
              {
                children: [
                  { text: 'Editable delivery summary for AI updates.' },
                ],
                type: 'paragraph',
              },
            ],
            type: 'tableCell',
          },
        ],
        type: 'tableRow',
      },
    ],
    columnWidths: [170, 170, 240],
    type: 'table',
  },
];
