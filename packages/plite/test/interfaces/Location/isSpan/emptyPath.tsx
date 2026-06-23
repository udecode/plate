/** @jsx jsx */

import { LocationApi, type Path } from '@platejs/plite';

export const input: Path = [];
export const test = (value: typeof input) => LocationApi.isSpan(value);
export const output = false;
