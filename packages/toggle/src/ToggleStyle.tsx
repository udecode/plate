import React, { useMemo } from 'react';
import { useEditorRef } from '@udecode/plate-common';
import { TIndentElement } from '@udecode/plate-indent';

import { idToClassName } from './injectNodeIdClassName';
import { buildToggleIndex } from './queries';
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
  const elementIdsToHide = findElementIdsToHide(openIds, elements);
  return `${elementIdsToSelector(elementIdsToHide)} ${hiddenElementsStyle}`;
};

const findElementIdsToHide = (
  openIds: Set<string>,
  elements: TIndentElement[]
): string[] => {
  const toggleIndex = buildToggleIndex(elements);
  return (
    elements
      .filter((_, index) =>
        toggleIndex[index].some((toggleId) => !openIds.has(toggleId))
      )
      // TODO do not rely on id being the key for the identifier
      .map((element) => element.id as string)
  );
};

const elementIdsToSelector = (ids: string[]) => {
  return ids.map((id) => `.${idToClassName(id)}`).join(',');
};

const hiddenElementsStyle = `{
  visibility: hidden;
  height: 0;
  margin: 0;
}`;
