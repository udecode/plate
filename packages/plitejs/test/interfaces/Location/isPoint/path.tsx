/** @jsx jsx */

import { LocationApi, type Path } from 'plitejs';

export const input: Path = [0, 1];
export const test = (value: typeof input) => LocationApi.isPoint(value);
export const output = false;
