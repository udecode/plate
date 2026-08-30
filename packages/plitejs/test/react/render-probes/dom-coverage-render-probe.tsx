import { NodeApi } from 'plitejs';
import React from 'react';

import {
  Editable,
  EditableElement,
  Plite,
  type Editor,
} from '../../../src/react';
import { DOMCoverageBoundaryRange } from '../../../src/react/components/dom-coverage-boundary';

export type DOMCoverageRenderCounts = {
  hiddenItems: number;
  outsideSibling: number;
};

export const createLargeBoundarySurface = ({
  editor,
  hiddenCount,
  renderCounts,
}: {
  editor: Editor;
  hiddenCount: number;
  renderCounts: DOMCoverageRenderCounts;
}) =>
  function LargeBoundarySurface({ hidden }: { hidden: boolean }) {
    return (
      <Plite editor={editor}>
        <Editable
          id="dom-coverage-large-boundary-expand"
          renderElement={({ children, element }) => {
            const text = NodeApi.string(element);

            if (text.startsWith('Hidden item ')) {
              renderCounts.hiddenItems += 1;
            }

            if (text === 'Outside sibling') {
              renderCounts.outsideSibling += 1;
            }

            if (element.type === 'section') {
              const childNodes = React.Children.toArray(children);

              return (
                <EditableElement>
                  {childNodes[0]}
                  <DOMCoverageBoundaryRange
                    boundaryId="large-section-body"
                    content={childNodes.slice(1)}
                    from={1}
                    hidden={hidden}
                    to={hiddenCount}
                  >
                    Large body collapsed
                  </DOMCoverageBoundaryRange>
                </EditableElement>
              );
            }

            return <EditableElement>{children}</EditableElement>;
          }}
        />
      </Plite>
    );
  };
