import React, { type HTMLAttributes } from 'react';
import {
  useEditorViewState,
  useOptionalEditorReadOnly,
} from '@platejs/plite-react';

import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { usePlateModelRevision } from '../internal/usePlateModelRevision';
import { useEditor, usePlateValue } from '../stores';

export const PlateContainer = ({
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  const editor = useEditor();

  usePlateModelRevision(editor);

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

  getPlateRuntime(editor).pluginCache.render.beforeContainer.forEach((key) => {
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

  getPlateRuntime(editor).pluginCache.render.afterContainer.forEach((key) => {
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
