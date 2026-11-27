import React, { type HTMLAttributes } from 'react';

import { failInvariant } from '../../internal/failInvariant';
import {
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import {
  PlateScopeContext,
  useAreaScope,
  usePlateScope,
  useScopeTarget,
} from '../internal/plate-context';
import { useComposedRef } from '../internal/react-helpers';
import { usePlateModelRevision } from '../internal/usePlateModelRevision';
import { useEditorScrollElementRef } from '../plite-react';
import { useEditorSelector } from '../stores/plate/useEditorSelector';

export const EditorContainer = ({
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  const area = useAreaScope(usePlateScope());
  const { containerRef, editor } =
    useScopeTarget(area) ??
    failInvariant('EditorContainer requires an active Plate editor.');

  usePlateModelRevision(editor);

  const readOnly = useEditorSelector(
    editor,
    (current) => current.read.view.isReadOnly(),
    { dependsOn: 'readOnly' }
  );

  const scrollElementRef = useEditorScrollElementRef(editor, {
    fallback: true,
  });
  const ref = useComposedRef(containerRef, scrollElementRef);

  let afterContainer: React.ReactNode = null;
  let beforeContainer: React.ReactNode = null;

  const mainContainer = (
    <div ref={ref} {...props}>
      <PlateScopeContext value={area}>{children}</PlateScopeContext>
    </div>
  );

  getPlateRuntime(editor).pluginCache.slots.beforeContainer.forEach((name) => {
    const plugin =
      getCompiledPlatePlugin(editor, name) ??
      failInvariant('Expected value to be defined');
    if (isEditOnly(readOnly, plugin, 'slots')) return;

    const BeforeContainer =
      plugin.slots.beforeContainer ??
      failInvariant('Expected value to be defined');

    beforeContainer = (
      <>
        {beforeContainer}
        <BeforeContainer containerRef={containerRef} />
      </>
    );
  });

  getPlateRuntime(editor).pluginCache.slots.afterContainer.forEach((name) => {
    const plugin =
      getCompiledPlatePlugin(editor, name) ??
      failInvariant('Expected value to be defined');
    if (isEditOnly(readOnly, plugin, 'slots')) return;

    const AfterContainer =
      plugin.slots.afterContainer ??
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

EditorContainer.displayName = 'EditorContainer';
