import create from 'zustand';
import createVanillaStore from 'zustand/vanilla';
import { EditorState } from '../types/EditorStore';

/**
 * Editor vanilla store.
 * @see zustand vanilla store
 */
export const editorStore = createVanillaStore<EditorState>(() => ({}));

/**
 * Editor store.
 * @see zustand store
 */
export const useEditorStore = create(editorStore);
