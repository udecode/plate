import React from 'react';
import { RenderElementProps, useFocused, useSelected } from 'slate-react';
import styled from 'styled-components';

const Image = styled.img<{ selected: boolean; focused: boolean }>`
  display: block;
  max-width: 100%;
  max-height: 20em;
  padding: 10px 0;
  box-shadow: ${(props) =>
    props.selected && props.focused ? '0 0 0 3px #B4D5FF' : 'none'};
`;

export const ImageElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  const url = element.url as string;
  const selected = useSelected();
  const focused = useFocused();

  const type = attributes['data-slate-type'];
  delete attributes['data-slate-type'];

  return (
    <div {...attributes}>
      <div contentEditable={false}>
        <Image
          data-slate-type={type}
          data-testid="ImageElementImage"
          src={url}
          alt=""
          selected={selected}
          focused={focused}
        />
      </div>
      {children}
    </div>
  );
};
