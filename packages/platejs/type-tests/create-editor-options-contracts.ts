import { BaseParagraphPlugin, createEditor } from 'platejs';
import {
  createEditor as createReactEditor,
  useCreateEditor,
} from 'platejs/react';

const initialValue = [{ children: [{ text: 'One' }], type: 'paragraph' }];

createEditor({
  plugins: [BaseParagraphPlugin],
  // @ts-expect-error -- the error names the document key, not the plugins
  value: initialValue,
});

createReactEditor({
  plugins: [BaseParagraphPlugin],
  // @ts-expect-error -- the error names the document key, not the plugins
  value: initialValue,
});

export const useMisspelledEditor = () =>
  useCreateEditor({
    plugins: [BaseParagraphPlugin],
    // @ts-expect-error -- the error names the document key, not the plugins
    value: initialValue,
  });
