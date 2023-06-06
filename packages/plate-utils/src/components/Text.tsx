import { ComponentPropsWithRef } from 'react';
import { createSlotComponent } from '../utils';

export const Text = createSlotComponent('span');

export type TextProps = ComponentPropsWithRef<typeof Text>;
