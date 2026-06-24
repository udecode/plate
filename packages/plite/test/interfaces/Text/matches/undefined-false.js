import { TextApi } from '@platejs/plite';

export const input = {
  text: { foo: undefined },
  props: { bar: undefined },
};

export const test = ({ text, props }) => TextApi.matches(text, props);

export const output = false;
