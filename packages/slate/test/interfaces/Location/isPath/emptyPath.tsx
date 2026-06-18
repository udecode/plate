/** @jsx jsx */

import { LocationApi, type Path } from '@platejs/slate';

export const input: Path = [];
export const test = (value: typeof input) => LocationApi.isPath(value);
export const output = true;
