/**
 * This Apache-2.0 licensed file has been modified by Udecode and other
 * contributors. See /packages/diff/LICENSE for more information.
 */

import { PlateEditor, TDescendant } from '@udecode/plate-common';

import { transformDiffDescendants } from './internal/transforms/transformDiffDescendants';
import { dmp } from './internal/utils/dmp';
import { StringCharMapping } from './internal/utils/string-char-mapping';
import { DiffProps } from './types';

export interface ComputeDiffOptions {
  isInline: PlateEditor['isInline'];
  ignoreProps?: string[];
  lineBreakChar?: string;
  shouldDiffDescendants?: (
    nodes: TDescendant[],
    nextNodes: TDescendant[]
  ) => boolean;
  getInsertProps: (node: TDescendant) => any;
  getDeleteProps: (node: TDescendant) => any;
  getUpdateProps: (
    node: TDescendant,
    properties: any,
    newProperties: any
  ) => any;
}

export const computeDiff = (
  doc0: TDescendant[],
  doc1: TDescendant[],
  {
    isInline = () => false,
    ignoreProps,
    getInsertProps = defaultGetInsertProps,
    getDeleteProps = defaultGetDeleteProps,
    getUpdateProps = defaultGetUpdateProps,
    ...options
  }: Partial<ComputeDiffOptions> = {}
): TDescendant[] => {
  const stringCharMapping = new StringCharMapping();

  const m0 = stringCharMapping.nodesToString(doc0);
  const m1 = stringCharMapping.nodesToString(doc1);

  const diff = dmp.diff_main(m0, m1);

  return transformDiffDescendants(diff, {
    isInline,
    ignoreProps,
    getInsertProps,
    getDeleteProps,
    getUpdateProps: (node, properties, newProperties) => {
      // Ignore the update if only ignored props have changed
      if (
        ignoreProps &&
        Object.keys(newProperties).every((key) => ignoreProps.includes(key))
      )
        return {};

      return getUpdateProps(node, properties, newProperties);
    },
    stringCharMapping,
    ...options,
  });
};

export const defaultGetInsertProps = (): DiffProps => ({
  diff: true,
  diffOperation: {
    type: 'insert',
  },
});

export const defaultGetDeleteProps = (): DiffProps => ({
  diff: true,
  diffOperation: {
    type: 'delete',
  },
});

export const defaultGetUpdateProps = (
  _node: TDescendant,
  properties: any,
  newProperties: any
): DiffProps => ({
  diff: true,
  diffOperation: {
    type: 'update',
    properties,
    newProperties,
  },
});
