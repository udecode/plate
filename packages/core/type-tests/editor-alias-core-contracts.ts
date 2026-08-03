import { type BaseEditor, DebugPlugin, HtmlPlugin } from '@platejs/core';
import type { PlateEditor } from '@platejs/core/react';
import type { Descendant } from '@platejs/plite';

declare const baseEditor: BaseEditor;
declare const expectDescendants: (value: Descendant[] | null) => void;
declare const plateEditor: PlateEditor;

baseEditor.plugin(DebugPlugin).api.log('base');
plateEditor.plugin(DebugPlugin).api.log('plate');

expectDescendants(
  baseEditor.plugin(HtmlPlugin).api.deserialize({
    element: '<p>base</p>',
  })
);

expectDescendants(
  plateEditor.plugin(HtmlPlugin).api.deserialize({
    element: '<p>plate</p>',
  })
);

baseEditor.update((tx) => {
  tx.history.undo();
});

plateEditor.update((tx) => {
  tx.history.undo();
});

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
