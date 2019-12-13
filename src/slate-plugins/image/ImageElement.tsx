import React from 'react';
import { css } from 'emotion';
import { RenderElementProps, useFocused, useSelected } from 'slate-react';

export const ImageElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  const selected = useSelected();
  const focused = useFocused();

  return (
    <div {...attributes}>
      <div contentEditable={false}>
        <img
          src={element.url}
          alt=""
          className={css`
            display: block;
            max-width: 100%;
            max-height: 20em;
            box-shadow: ${selected && focused ? '0 0 0 3px #B4D5FF' : 'none'};
          `}
        />
      </div>
      {children}
    </div>
  );
};
