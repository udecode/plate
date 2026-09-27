import {
  type Editor as HeadlessEditor,
  DebugPlugin,
  HtmlPlugin,
} from 'platejs';
import type { Editor } from 'platejs/react';

import type { ContentSlice } from '../src/core';

declare const baseEditor: HeadlessEditor;
declare const expectSlice: (value: ContentSlice | null) => void;
declare const plateEditor: Editor;

baseEditor.plugin(DebugPlugin).api.log('base');
plateEditor.plugin(DebugPlugin).api.log('plate');

const baseHtml = baseEditor.plugin(HtmlPlugin).api.parseSlice('<p>base</p>');

expectSlice(baseHtml.ok ? baseHtml.slice : null);
const plateHtml = plateEditor.plugin(HtmlPlugin).api.parseSlice('<p>plate</p>');

expectSlice(plateHtml.ok ? plateHtml.slice : null);

baseEditor.api.history.undo();
plateEditor.api.history.undo();

// Unparameterized editors expose only the guaranteed Core capabilities.
// @ts-expect-error Unknown API groups are never synthesized.
baseEditor.api.notARealCoreApi();

// @ts-expect-error Unknown API groups are never synthesized.
plateEditor.api.notARealCoreApi();

baseEditor.update((tx) => {
  // @ts-expect-error Unknown transaction groups are never synthesized.
  tx.notARealCoreTx.run();
});

plateEditor.update((tx) => {
  // @ts-expect-error Unknown transaction groups are never synthesized.
  tx.notARealCoreTx.run();
});
