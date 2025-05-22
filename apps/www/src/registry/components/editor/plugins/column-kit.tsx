'use client';

import { ColumnPlugin } from '@udecode/plate-layout/react';

import { ColumnElement, ColumnGroupElement } from '@/registry/ui/column-node';

export const ColumnKit = [
  ColumnPlugin.configure({
    override: {
      components: {
        column: ColumnElement,
        column_group: ColumnGroupElement,
      },
    },
  }),
];
