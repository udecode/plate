import React from 'react';

import { createSlotComponent } from './createSlotComponent';

export const Box = createSlotComponent('div');

export type BoxProps = React.ComponentPropsWithRef<typeof Box>;
