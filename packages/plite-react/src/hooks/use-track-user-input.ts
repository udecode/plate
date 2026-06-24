import { useCallback, useEffect, useRef } from 'react';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import { useEditor } from './use-editor';

export function useTrackUserInput() {
  const editor = useEditor<ReactRuntimeEditor>();

  const receivedUserInput = useRef<boolean>(false);
  const animationFrameIdRef = useRef<number>(0);

  const onUserInput = useCallback(() => {
    if (receivedUserInput.current) {
      return;
    }

    receivedUserInput.current = true;

    const window = ReactEditor.getWindow(editor);
    window.cancelAnimationFrame(animationFrameIdRef.current);

    animationFrameIdRef.current = window.requestAnimationFrame(() => {
      receivedUserInput.current = false;
    });
  }, [editor]);

  useEffect(() => () => cancelAnimationFrame(animationFrameIdRef.current), []);

  return {
    receivedUserInput,
    onUserInput,
  };
}
