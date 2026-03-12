import { createEditor, withHistory } from '@platejs/slate';

const editor = withHistory(createEditor());

void editor.history.redos;
void editor.history.undos;
editor.undo();
editor.redo();
editor.api.isSaving();
editor.api.isMerging();
editor.api.isSplittingOnce();
editor.tf.withMerging(() => {});
editor.tf.withNewBatch(() => {});
editor.tf.withoutMerging(() => {});
editor.tf.withoutSaving(() => {});
editor.tf.setSplittingOnce(true);
editor.tf.setSplittingOnce(undefined);

const selectionBefore = editor.history.undos[0]?.selectionBefore;

void selectionBefore;

// @ts-expect-error history batches require operations
editor.history.undos.push({ selectionBefore: null });

// @ts-expect-error splitting flag must be boolean or undefined
editor.tf.setSplittingOnce('invalid');
