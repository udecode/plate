'use client';

import { ColumnItemPlugin, ColumnPlugin } from '@udecode/plate-layout/react';

import { ColumnElement, ColumnGroupElement } from '@/registry/ui/column-node';

export const ColumnKit = [
  ColumnPlugin.withComponent(ColumnGroupElement),
  ColumnItemPlugin.withComponent(ColumnElement),
];
