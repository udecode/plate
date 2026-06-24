/** @jsx jsx  */
import { NodeApi } from '@platejs/plite';

export const input = (
  <editor>
    <element>
      <text />
    </element>
  </editor>
);
export const test = (value) => {
  try {
    return NodeApi.getIf(value, ['__proto__' as any]);
  } catch (error) {
    return error.message;
  }
};
export const output = 'Got non-numeric path index';
