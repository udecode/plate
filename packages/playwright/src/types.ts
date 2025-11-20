import type { JSHandle } from '@playwright/test';
import type { NodeApi } from 'platejs';
import type { PlateEditor } from 'platejs/react';

export type EditorHandle<E extends PlateEditor = PlateEditor> = JSHandle<E>;

export type TPlatePlaywrightAdapter = {
  EDITABLE_TO_EDITOR: WeakMap<HTMLElement, PlateEditor>;
  getNode: typeof NodeApi.get;
};
