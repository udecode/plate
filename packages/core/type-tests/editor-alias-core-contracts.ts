import type { BaseEditor } from '@platejs/core';
import type { PlateEditor } from '@platejs/core/react';

declare const baseEditor: BaseEditor;
declare const plateEditor: PlateEditor;

baseEditor.api.debug.log('base');
plateEditor.api.debug.log('plate');

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
