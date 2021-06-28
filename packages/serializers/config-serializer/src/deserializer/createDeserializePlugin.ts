import {
  getSlatePluginWithOverrides,
  SPEditor,
  TElement,
  WithOverride,
} from '@udecode/slate-plugins-core';
import { ReactEditor } from 'slate-react';

export const withDeserialize = (): WithOverride<ReactEditor & SPEditor> => (
  editor
) => {
  /* editor.deserializerOrder = [
    'application/x-slate-fragment',
    'text/html',
    'text/plain',
  ]; */

  return editor;
};

export const createDeserializePlugin = getSlatePluginWithOverrides(
  withDeserialize
);
