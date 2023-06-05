import { ComponentProps } from 'react';
import { createSlotComponent } from '../utils/createComponentAs';

export const Box = createSlotComponent('div');

export type BoxProps = ComponentProps<typeof Box>;
