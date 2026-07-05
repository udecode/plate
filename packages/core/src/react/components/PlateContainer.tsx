import React, { type HTMLAttributes } from 'react';
import {
  useEditorViewState,
  useOptionalEditorReadOnly,
} from '@platejs/plite-react';

import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import { useEditorRef, usePlateValue } from '../stores';

export const PlateContainer = ({
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  const editor = useEditorRef();
  const plateReadOnly = useOptionalEditorReadOnly();
  const editorReadOnly = useEditorViewState(editor, (view) =>
    view.isReadOnly()
  );
  const readOnly = plateReadOnly ?? editorReadOnly;

  const containerRef = usePlateValue('containerRef');

  let afterContainer: React.ReactNode = null;
  let beforeContainer: React.ReactNode = null;

  const mainContainer = (
    <div ref={containerRef} {...props}>
      {children}
    </div>
  );

  editor.runtime.pluginCache.render.beforeContainer.forEach((key) => {
    const plugin = editor.getPlugin({ key });
    if (isEditOnly(readOnly, plugin, 'render')) return;

    const BeforeContainer = plugin.render.beforeContainer!;

    beforeContainer = (
      <>
        {beforeContainer}
        <BeforeContainer {...props} />
      </>
    );
  });

  editor.runtime.pluginCache.render.afterContainer.forEach((key) => {
    const plugin = editor.getPlugin({ key });
    if (isEditOnly(readOnly, plugin, 'render')) return;

    const AfterContainer = plugin.render.afterContainer!;

    afterContainer = (
      <>
        {afterContainer}
        <AfterContainer {...props} />
      </>
    );
  });

  return (
    <>
      {beforeContainer}
      {mainContainer}
      {afterContainer}
    </>
  );
};

PlateContainer.displayName = 'PlateContainer';
