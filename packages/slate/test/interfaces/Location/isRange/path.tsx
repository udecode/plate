/** @jsx jsx */

import { LocationApi, type Path } from '@platejs/slate';

export const input: Path = [0, 1];
export const test = (value: typeof input) => LocationApi.isRange(value);
export const output = false;
