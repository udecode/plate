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
    <div id={editor.uid} ref={containerRef} {...props}>
      {children}
    </div>
  );

  editor.pluginList.forEach((plugin) => {
    if (isEditOnly(readOnly, plugin, 'render')) return;

    const {
      render: {
        afterContainer: AfterContainer,
        beforeContainer: BeforeContainer,
      } = {},
    } = plugin;

    if (AfterContainer) {
      afterContainer = (
        <>
          {afterContainer}
          <AfterContainer {...props} />
        </>
      );
    }
    if (BeforeContainer) {
      beforeContainer = (
        <>
          {beforeContainer}
          <BeforeContainer {...props} />
        </>
      );
    }
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
