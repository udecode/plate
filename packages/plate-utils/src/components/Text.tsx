import { ComponentProps } from 'react';
import { createSlotComponent } from '../utils';

export const Text = createSlotComponent('span');

export type TextProps = ComponentProps<typeof Text>;
