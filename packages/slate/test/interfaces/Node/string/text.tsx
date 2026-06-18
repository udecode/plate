/** @jsx jsx  */
import { NodeApi } from '@platejs/slate';

export const input = <text>one</text>;
export const test = (value) => NodeApi.string(value);
export const output = 'one';
