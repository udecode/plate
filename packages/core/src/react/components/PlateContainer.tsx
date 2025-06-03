import React, { type HTMLAttributes } from 'react';

import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import {
  useEditorContainerRef,
  useEditorReadOnly,
  useEditorRef,
} from '../stores';

export const PlateContainer = ({
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  const editor = useEditorRef();
  const readOnly = useEditorReadOnly();

  const containerRef = useEditorContainerRef();

  let afterContainer: React.ReactNode = null;
  let beforeContainer: React.ReactNode = null;

  const mainContainer = (
    <div id={editor.meta.uid} ref={containerRef} {...props}>
      {children}
    </div>
  );

  editor.meta.pluginKeys.render.beforeContainer.forEach((key) => {
    const plugin = editor.plugins[key];
    if (isEditOnly(readOnly, plugin, 'render')) return;

    const BeforeContainer = plugin.render.beforeContainer!;

    beforeContainer = (
      <>
        {beforeContainer}
        <BeforeContainer {...props} />
      </>
    );
  });

  editor.meta.pluginKeys.render.afterContainer.forEach((key) => {
    const plugin = editor.plugins[key];
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
