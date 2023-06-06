import { ComponentPropsWithRef } from 'react';
import { createSlotComponent } from '../utils/createSlotComponent';

export const Box = createSlotComponent('div');

export type BoxProps = ComponentPropsWithRef<typeof Box>;
