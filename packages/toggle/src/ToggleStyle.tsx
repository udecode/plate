import React, { useMemo } from 'react';
import { useEditorRef } from '@udecode/plate-common';
import { TIndentElement } from '@udecode/plate-indent';

import { idToClassName } from './injectNodeIdClassName';
import { findElementIdsHiddenInToggle } from './queries';
import { useToggleControllerStore } from './store';

// TODO restrict to the editor
export const ToggleStyle = () => {
  const { children } = useEditorRef();
  const [openIds] = useToggleControllerStore().use.openIds();
  const css = useMemo(
    () => hideElementsInToggleCSS(openIds, children as TIndentElement[]),
    [openIds, children]
  );

  return <style>{css}</style>;
};

const hideElementsInToggleCSS = (
  openIds: Set<string>,
  elements: TIndentElement[]
) => {
  const elementIdsToHide = findElementIdsHiddenInToggle(openIds, elements);
  return `${elementIdsToSelector(elementIdsToHide)} ${hiddenElementsStyle}`;
};

const elementIdsToSelector = (ids: string[]) => {
  return ids.map((id) => `.${idToClassName(id)}`).join(',');
};

const hiddenElementsStyle = `{
  visibility: hidden;
  height: 0;
  margin: 0;
}`;
