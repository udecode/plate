import type { JSHandle } from '@playwright/test';
import type { Path } from '@platejs/plite';
import type { PlateEditor } from 'platejs/react';

export type EditorHandle<E extends PlateEditor = PlateEditor> = JSHandle<E>;

export type TPlatePlaywrightAdapter = {
  EDITABLE_TO_EDITOR: WeakMap<HTMLElement, PlateEditor>;
  getNode: (editor: PlateEditor, path: Path) => unknown | undefined;
};
