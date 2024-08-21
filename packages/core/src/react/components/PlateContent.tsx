import React, { useCallback, useEffect, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import type { TEditableProps } from '@udecode/slate-react';

import { useComposedRef } from '@udecode/react-utils';
import { Editable } from 'slate-react';

import { useEditableProps } from '../hooks';
import { type PlateHotkey, getPluginContext } from '../plugin';
import { type PlateStoreState, useEditorRef } from '../stores';
import { EditorMethodsEffect } from './EditorMethodsEffect';
import { EditorRefEffect } from './EditorRefEffect';
import { EditorStateEffect } from './EditorStateEffect';
import { PlateControllerEffect } from './PlateControllerEffect';
import { PlateSlate } from './PlateSlate';

export type PlateContentProps = {
  decorate?: PlateStoreState['decorate'];
  /** R enders the editable content. */
  renderEditable?: (editable: React.ReactElement) => React.ReactNode;
} & Omit<TEditableProps, 'decorate'>;

/**
 * Editable with plugins.
 *
 * - Decorate prop
 * - DOM handler props
 * - ReadOnly prop
 * - RenderAfterEditable
 * - RenderBeforeEditable
 * - RenderElement prop
 * - RenderLeaf prop
 * - UseHooks
 */
const PlateContent = React.forwardRef(
  ({ renderEditable, ...props }: PlateContentProps, ref) => {
    const { id } = props;

    const editor = useEditorRef(id);

    if (!editor) {
      throw new Error(
        'Editor not found. Please ensure that PlateContent is rendered below Plate.'
      );
    }

    const editableProps = useEditableProps(props);

    const editableRef = useRef<HTMLDivElement | null>(null);
    const hotkeyRefs = useRef<(HTMLElement | null)[]>([]);

    const addHotkeyRef = useCallback((ref: HTMLElement | null) => {
      if (ref && !hotkeyRefs.current.includes(ref)) {
        hotkeyRefs.current.push(ref);
      }
    }, []);

    const combinedRef = useComposedRef(
      ref,
      editableRef,
      ...(hotkeyRefs.current as any)
    );

    const editable = <Editable ref={combinedRef} {...(editableProps as any)} />;

    let afterEditable: React.ReactNode = null;
    let beforeEditable: React.ReactNode = null;

    editor.pluginList.forEach((plugin) => {
      const {
        renderAfterEditable: RenderAfterEditable,
        renderBeforeEditable: RenderBeforeEditable,
      } = plugin;

      if (RenderAfterEditable) {
        afterEditable = (
          <>
            {afterEditable}
            <RenderAfterEditable {...editableProps} />
          </>
        );
      }
      if (RenderBeforeEditable) {
        beforeEditable = (
          <>
            {beforeEditable}
            <RenderBeforeEditable {...editableProps} />
          </>
        );
      }
    });

    let aboveEditable: React.ReactNode = (
      <>
        {beforeEditable}

        {renderEditable ? renderEditable(editable) : editable}

        <EditorMethodsEffect id={id} />
        <EditorHotkeysEffect addHotkeyRef={addHotkeyRef} id={id} />
        <EditorStateEffect id={id} />
        <EditorRefEffect id={id} />
        <PlateControllerEffect id={id} />

        {afterEditable}
      </>
    );

    editor.pluginList.forEach((plugin) => {
      const { renderAboveEditable: RenderAboveEditable } = plugin;

      if (RenderAboveEditable)
        aboveEditable = (
          <RenderAboveEditable>{aboveEditable}</RenderAboveEditable>
        );
    });

    return <PlateSlate id={id}>{aboveEditable}</PlateSlate>;
  }
);
PlateContent.displayName = 'PlateContent';

export { PlateContent };

export function EditorHotkeysEffect({
  addHotkeyRef,
  id,
}: {
  addHotkeyRef: (ref: HTMLElement | null) => void;
  id?: string;
}) {
  const editor = useEditorRef(id);

  return (
    <>
      {Object.entries(editor.hotkeys).map(([hotkeyString, hotkeyConfig]) => {
        if (!hotkeyConfig) return null;

        return (
          <HotkeyEffect
            addHotkeyRef={addHotkeyRef}
            hotkeyConfig={hotkeyConfig}
            id={id}
            key={hotkeyString}
          />
        );
      })}
    </>
  );
}

function HotkeyEffect({
  addHotkeyRef,
  hotkeyConfig,
  id,
}: {
  addHotkeyRef: (ref: HTMLElement | null) => void;
  hotkeyConfig: PlateHotkey;
  id?: string;
}) {
  const editor = useEditorRef(id);

  const ref = useHotkeys(
    hotkeyConfig.hotkey,
    (event, handler) => {
      hotkeyConfig.callback({
        ...getPluginContext(editor, {} as any),
        event,
        handler,
      });
    },
    {
      enableOnContentEditable: true,
      ...hotkeyConfig.options,
    },
    []
  );

  useEffect(() => {
    addHotkeyRef(ref.current);

    return () => addHotkeyRef(null);
  }, [addHotkeyRef, ref]);

  return null;
}
