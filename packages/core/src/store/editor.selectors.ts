import { SPEditor } from '../types/SPEditor';
import { useEditorStore } from './editor.store';
import {
  useStoreEditorRef,
  useStoreEditorState,
} from './useSlatePluginsSelectors';

export const useFocusedEditorId = () =>
  useEditorStore((state) => state.focusedEditorId);
export const useBlurredEditorId = () =>
  useEditorStore((state) => state.blurredEditorId);

export const useFocusedEditorRef = <T extends SPEditor = SPEditor>() =>
  useStoreEditorRef<T>(useFocusedEditorId());
export const useBlurredEditorRef = <T extends SPEditor = SPEditor>() =>
  useStoreEditorRef<T>(useBlurredEditorId());

export const useFocusedEditorState = <T extends SPEditor = SPEditor>() =>
  useStoreEditorState<T>(useFocusedEditorId());
export const useBlurredEditorState = <T extends SPEditor = SPEditor>() =>
  useStoreEditorState<T>(useBlurredEditorId());
