import type React from 'react';

import { createSlotComponent } from './createSlotComponent';

export const Text = createSlotComponent('span');

export type TextProps = React.ComponentPropsWithRef<typeof Text>;
