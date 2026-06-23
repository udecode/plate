import React from 'react';

import type { Editor } from '@platejs/plite';
import { isDefined } from '@udecode/utils';
import { useAtomStoreValue } from 'jotai-x';

import type { PlateStoreState } from '../stores';

import { getCurrentRuntimeTransforms } from '../../internal/currentRuntimeBridge';
import { PliteExtensionPlugin } from '../../lib';
import { usePlateStore } from '../stores';
import { EditorHotkeysEffect } from './EditorHotkeysEffect';
import { EditorMethodsEffect } from './EditorMethodsEffect';
import { EditorRefEffect } from './EditorRefEffect';
import { PlateControllerEffect } from './PlateControllerEffect';

export type PlateContentEffectsProps = {
  editableRef: React.RefObject<HTMLDivElement | null>;
  id?: string;
};

export function PlateContentEffects({
  editableRef,
  id,
}: PlateContentEffectsProps) {
  return (
    <>
      <EditorMethodsEffect id={id} />
      <EditorHotkeysEffect id={id} editableRef={editableRef} />
      <EditorRefEffect id={id} />
      <PlateControllerEffect id={id} />
    </>
  );
}

type PlateContentStateEditor = {
  focus?: () => void;
  read?: Editor['read'];
  setOption: (plugin: { key: string }, key: string, value: unknown) => void;
  update?: Editor['update'];
};

export function PlateContentStateEffect({
  id,
  autoFocusOnEditable,
  disabled,
  editor,
  readOnly,
}: {
  editor: PlateContentStateEditor;
  id?: string;
  autoFocusOnEditable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  const store = usePlateStore(id);

  // Sync PlateContent.readOnly to Plate.readOnly
  React.useLayoutEffect(() => {
    if (disabled) {
      store.setReadOnly(true);
      return;
    }

    if (isDefined(readOnly)) {
      store.setReadOnly(readOnly);
    }
  }, [disabled, readOnly, store]);

  // Sync onNodeChange from store to PliteExtensionPlugin
  const onNodeChange = useAtomStoreValue(store, 'onNodeChange') as NonNullable<
    PlateStoreState['onNodeChange']
  > | null;
  React.useLayoutEffect(() => {
    if (onNodeChange) {
      editor.setOption(PliteExtensionPlugin, 'onNodeChange', onNodeChange);
    }
  }, [editor, onNodeChange]);

  // Sync onTextChange from store to PliteExtensionPlugin
  const onTextChange = useAtomStoreValue(store, 'onTextChange') as NonNullable<
    PlateStoreState['onTextChange']
  > | null;
  React.useLayoutEffect(() => {
    if (onTextChange) {
      editor.setOption(PliteExtensionPlugin, 'onTextChange', onTextChange);
    }
  }, [editor, onTextChange]);

  const prevReadOnly = React.useRef(readOnly);

  React.useEffect(() => {
    const focus =
      editor.focus ?? (() => getCurrentRuntimeTransforms(editor).focus());

    if (
      autoFocusOnEditable &&
      prevReadOnly.current &&
      !readOnly &&
      editor.read &&
      editor.update &&
      focus
    ) {
      const point = editor.read((state) => state.points.end([]));

      editor.update((tx) => {
        tx.selection.set({ anchor: point, focus: point });
      });
      focus();
    }

    prevReadOnly.current = readOnly;
  }, [autoFocusOnEditable, editor, readOnly]);

  return null;
}
