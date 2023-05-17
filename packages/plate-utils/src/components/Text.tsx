import React from 'react';
import { AsProps } from '../types';
import { createComponentAs, createElementAs } from '../utils';

export const Text = createComponentAs<AsProps<'span'>>((props) =>
  createElementAs('span', props)
);

export type TextProps = React.ComponentProps<typeof Text>;
