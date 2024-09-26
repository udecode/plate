/**
 * This Apache-2.0 licensed file has been modified by Udecode and other
 * contributors. See /packages/diff/LICENSE for more information.
 */

import type { SlateEditor, TDescendant, TElement } from '@udecode/plate-common';

import type { DiffProps } from './types';

import { transformDiffDescendants } from '../internal/transforms/transformDiffDescendants';
import { dmp } from '../internal/utils/dmp';
import { StringCharMapping } from '../internal/utils/string-char-mapping';

export interface ComputeDiffOptions {
  getUpdateProps: (
    node: TDescendant,
    properties: any,
    newProperties: any
  ) => any;
  getDeleteProps: (node: TDescendant) => any;
  getInsertProps: (node: TDescendant) => any;
  isInline: SlateEditor['isInline'];
  elementsAreRelated?: (
    element: TElement,
    nextElement: TElement
  ) => boolean | null;
  ignoreProps?: string[];
  lineBreakChar?: string;
}

export const computeDiff = (
  doc0: TDescendant[],
  doc1: TDescendant[],
  {
    getDeleteProps = defaultGetDeleteProps,
    getInsertProps = defaultGetInsertProps,
    getUpdateProps = defaultGetUpdateProps,
    ignoreProps,
    isInline = () => false,
    ...options
  }: Partial<ComputeDiffOptions> = {}
): TDescendant[] => {
  const stringCharMapping = new StringCharMapping();

  const m0 = stringCharMapping.nodesToString(doc0);
  const m1 = stringCharMapping.nodesToString(doc1);

  const diff = dmp.diff_main(m0, m1);

  return transformDiffDescendants(diff, {
    getDeleteProps,
    getInsertProps,
    getUpdateProps: (node, properties, newProperties) => {
      // Ignore the update if only ignored props have changed
      if (
        ignoreProps &&
        Object.keys(newProperties).every((key) => ignoreProps.includes(key))
      )
        return {};

      return getUpdateProps(node, properties, newProperties);
    },
    ignoreProps,
    isInline,
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
    newProperties,
    properties,
    type: 'update',
  },
});
