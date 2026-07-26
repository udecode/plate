/**
 * This Apache-2.0 licensed file has been modified by Udecode and other
 * contributors. See /packages/diff/LICENSE for more information.
 */

import type { Descendant, Element } from '@platejs/plite';

import type { DiffProps } from './types';

import { transformDiffDescendants } from '../internal/transforms/transformDiffDescendants';
import { dmp } from '../internal/utils/dmp';
import { StringCharMapping } from '../internal/utils/string-char-mapping';

export type DiffProperties = Record<string, unknown>;

export type ComputeDiffOptions = {
  isInline: (element: Descendant) => boolean;
  getDeleteProps: (node: Descendant) => DiffProperties;
  getInsertProps: (node: Descendant) => DiffProperties;
  getUpdateProps: (
    node: Descendant,
    properties: DiffProperties,
    newProperties: DiffProperties
  ) => DiffProperties;
  ignoreProps?: string[];
  lineBreakChar?: string;
  elementsAreRelated?: (
    element: Element,
    nextElement: Element
  ) => boolean | null;
};

export const computeDiff = (
  doc0: readonly Descendant[],
  doc1: readonly Descendant[],
  {
    elementsAreRelated,
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
    elementsAreRelated,
    getDeleteProps,
    getInsertProps,
    ignoreProps,
    isInline,
    stringCharMapping,
    getUpdateProps: (node, properties, newProperties) => {
      const changedKeys = new Set([
        ...Object.keys(properties),
        ...Object.keys(newProperties),
      ]);

      // Ignore the update if only ignored props have changed
      if (
        ignoreProps &&
        [...changedKeys].every((key) => ignoreProps.includes(key))
      )
        return {};

      return getUpdateProps(node, properties, newProperties);
    },
    ...options,
  });
};

export const defaultGetInsertProps = (): DiffProps => ({
  diff: true,
  diffIntent: {
    type: 'insert',
  },
});

export const defaultGetDeleteProps = (): DiffProps => ({
  diff: true,
  diffIntent: {
    type: 'delete',
  },
});

export const defaultGetUpdateProps = (
  _node: Descendant,
  properties: DiffProperties,
  newProperties: DiffProperties
): DiffProps => ({
  diff: true,
  diffIntent: {
    newProperties,
    properties,
    type: 'update',
  },
});
