import React, { useEffect } from 'react';
import { useSlate } from 'slate-react';
import styled from 'styled-components';
import { PortalBody } from 'components/PortalBody';
import { isSelecting } from 'components/queries';
import { setPositionAtSelection } from 'components/utils';
import { Toolbar, ToolbarProps } from './Toolbar';

const StyledToolbar = styled(Toolbar)`
  position: absolute;
  z-index: 1;
  top: -10000px;
  left: -10000px;

  padding: 8px 7px 6px;
  margin-top: -6px;
  background-color: #222;
  border-radius: 4px;
  opacity: 0;
`;

interface Props extends ToolbarProps {
  children: any;
}

export const HoveringToolbar = ({ children, ...props }: Props) => {
  const ref = React.useRef<HTMLElement>();
  const editor = useSlate();

  useEffect(() => {
    const el = ref.current;
    // TODO: test
    if (!el) return;

    if (!isSelecting(editor)) {
      el.removeAttribute('style');
      return;
    }

    setPositionAtSelection(el);
  });

  return (
    <PortalBody>
      <StyledToolbar {...props} ref={ref}>
        {children}
      </StyledToolbar>
    </PortalBody>
  );
};
