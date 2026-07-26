'use client';

import { ColumnItemPlugin, ColumnPlugin } from '@platejs/layout/react';

import { ColumnElement, ColumnGroupElement } from '@/registry/ui/column-node';

export const ColumnKit = [
  ColumnPlugin.configure({ component: ColumnGroupElement }),
  ColumnItemPlugin.configure({ component: ColumnElement }),
];
