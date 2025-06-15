import React, { useEffect } from 'react';

import { useHotkeys } from '@udecode/react-hotkeys';
import { isDefined } from '@udecode/utils';

import type { Shortcut } from '../plugin';

import { useEditorRef } from '../stores';

export function EditorHotkeysEffect({
  id,
  editableRef,
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
  id?: string;
}) {
  const editor = useEditorRef(id);

  return (
    <>
      {Object.entries(editor.meta.shortcuts).map(
        ([hotkeyString, hotkeyConfig]) => {
          if (
            !hotkeyConfig ||
            !isDefined(hotkeyConfig.keys) ||
            !hotkeyConfig.handler
          ) {
            return null;
          }

          return (
            <HotkeyEffect
              id={id}
              key={hotkeyString}
              editableRef={editableRef}
              hotkeyConfig={hotkeyConfig}
            />
          );
        }
      )}
    </>
  );
}

function HotkeyEffect({
  id,
  editableRef,
  hotkeyConfig,
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
  hotkeyConfig: Shortcut;
  id?: string;
}) {
  const editor = useEditorRef(id);
  const { keys, handler, ...options } = hotkeyConfig;

  const setHotkeyRef = useHotkeys<HTMLDivElement>(
    keys!,
    (event, eventDetails) => {
      if (
        handler!({
          editor,
          event,
          eventDetails,
        }) !== false &&
        !isDefined(options.preventDefault)
      ) {
        // Prevent default if handler returns false and preventDefault is true
        event.preventDefault();
        event.stopPropagation();
      }
    },
    {
      enableOnContentEditable: true,
      ...options,
    },
    []
  );

  useEffect(() => {
    if (editableRef.current) {
      setHotkeyRef(editableRef.current);
    }
  }, [setHotkeyRef, editableRef]);

  return null;
}
