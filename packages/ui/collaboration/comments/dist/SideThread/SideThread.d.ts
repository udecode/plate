import React from 'react';
import { StyledProps } from '@udecode/plate-styled-components';
import { CommonThreadAndSideThreadProps } from '../Thread';
import { ThreadPosition } from '../useComments';
declare type SideThreadProps = {
    position: ThreadPosition;
} & StyledProps & CommonThreadAndSideThreadProps;
export declare function SideThread({ position, ...props }: SideThreadProps): React.ReactPortal;
export {};
//# sourceMappingURL=SideThread.d.ts.map