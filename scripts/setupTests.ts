import '@testing-library/jest-dom/extend-expect';
import 'slate-test-utils/dist/cjs/mocks';
import { TextEncoder } from 'node:util';

global.TextEncoder = TextEncoder;

jest.spyOn(global.console, 'warn').mockImplementation(() => jest.fn());
jest.spyOn(global.console, 'error').mockImplementation(() => jest.fn());

jest.mock('nanoid', () => ({
  nanoid: () => '1',
}));

jest.mock('@udecode/plate-core', () => ({
  __esModule: true,
  // @ts-ignore
  ...jest.requireActual('@udecode/plate-core'),
}));
