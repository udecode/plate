import { TextApi } from '@platejs/slate';

export const input = {
  text: { foo: undefined },
  props: { bar: undefined },
};

export const test = ({ text, props }) => TextApi.matches(text, props);

export const output = false;
