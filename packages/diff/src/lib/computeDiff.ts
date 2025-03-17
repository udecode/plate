/**
 * This Apache-2.0 licensed file has been modified by Udecode and other
 * contributors. See /packages/diff/LICENSE for more information.
 */

import type { Descendant, EditorApi, TElement } from '@udecode/plate';

import type { DiffProps } from './types';

import { transformDiffDescendants } from '../internal/transforms/transformDiffDescendants';
import { dmp } from '../internal/utils/dmp';
import { StringCharMapping } from '../internal/utils/string-char-mapping';

export interface ComputeDiffOptions {
  isInline: EditorApi['isInline'];
  getDeleteProps: (node: Descendant) => any;
  getInsertProps: (node: Descendant) => any;
  getUpdateProps: (
    node: Descendant,
    properties: any,
    newProperties: any
  ) => any;
  ignoreProps?: string[];
  lineBreakChar?: string;
  elementsAreRelated?: (
    element: TElement,
    nextElement: TElement
  ) => boolean | null;
}

export const computeDiff = (
  doc0: Descendant[],
  doc1: Descendant[],
  {
    getDeleteProps = defaultGetDeleteProps,
    getInsertProps = defaultGetInsertProps,
    getUpdateProps = defaultGetUpdateProps,
    ignoreProps,
    isInline = () => false,
    ...options
  }: Partial<ComputeDiffOptions> = {}
): Descendant[] => {
  const stringCharMapping = new StringCharMapping();

  const m0 = stringCharMapping.nodesToString(doc0);
  const m1 = stringCharMapping.nodesToString(doc1);

  const diff = dmp.diff_main(m0, m1);

  return transformDiffDescendants(diff, {
    getDeleteProps,
    getInsertProps,
    ignoreProps,
    isInline,
    stringCharMapping,
    getUpdateProps: (node, properties, newProperties) => {
      // Ignore the update if only ignored props have changed
      if (
        ignoreProps &&
        Object.keys(newProperties).every((key) => ignoreProps.includes(key))
      )
        return {};

      return getUpdateProps(node, properties, newProperties);
    },
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
  _node: Descendant,
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
