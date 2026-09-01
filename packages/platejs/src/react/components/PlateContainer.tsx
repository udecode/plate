import React, { type HTMLAttributes } from 'react';

import { failInvariant } from '../../internal/failInvariant';
import {
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import { useComposedRef } from '../internal/react-helpers';
import { usePlateModelRevision } from '../internal/usePlateModelRevision';
import {
  useEditorViewState,
  useEditorScrollElementRef,
  useOptionalEditorReadOnly,
} from '../plite-react';
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
  const scrollElementRef = useEditorScrollElementRef(editor);
  const ref = useComposedRef(containerRef, scrollElementRef);

  let afterContainer: React.ReactNode = null;
  let beforeContainer: React.ReactNode = null;

  const mainContainer = (
    <div ref={ref} {...props}>
      {children}
    </div>
  );

  getPlateRuntime(editor).pluginCache.render.beforeContainer.forEach((name) => {
    const plugin =
      getCompiledPlatePlugin(editor, name) ??
      failInvariant('Expected value to be defined');
    if (isEditOnly(readOnly, plugin, 'render')) return;

    const BeforeContainer =
      plugin.render.beforeContainer ??
      failInvariant('Expected value to be defined');

    beforeContainer = (
      <>
        {beforeContainer}
        <BeforeContainer containerRef={containerRef} />
      </>
    );
  });

  getPlateRuntime(editor).pluginCache.render.afterContainer.forEach((name) => {
    const plugin =
      getCompiledPlatePlugin(editor, name) ??
      failInvariant('Expected value to be defined');
    if (isEditOnly(readOnly, plugin, 'render')) return;

    const AfterContainer =
      plugin.render.afterContainer ??
      failInvariant('Expected value to be defined');

    afterContainer = (
      <>
        {afterContainer}
        <AfterContainer containerRef={containerRef} />
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
