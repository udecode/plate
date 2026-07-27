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

// @ts-expect-error unparameterized BaseEditor must not accept fake APIs
baseEditor.api.notARealCoreApi();

// @ts-expect-error unparameterized PlateEditor must not accept fake APIs
plateEditor.api.notARealCoreApi();

baseEditor.update((tx) => {
  // @ts-expect-error unparameterized BaseEditor tx must not accept fake groups
  tx.notARealCoreTx.run();
});

plateEditor.update((tx) => {
  // @ts-expect-error unparameterized PlateEditor tx must not accept fake groups
  tx.notARealCoreTx.run();
});
