import { BaseFieldPlugin } from '../../../features/field/lib';
import { toReactPlugin } from '../../core';

/** The field plugin for a React editor. */
export const FieldPlugin = toReactPlugin(BaseFieldPlugin);
