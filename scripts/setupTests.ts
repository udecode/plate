import { TextEncoder } from 'node:util';

import '@testing-library/jest-dom';
import 'slate-test-utils/dist/cjs/mocks';

global.TextEncoder = TextEncoder;

jest.spyOn(global.console, 'warn').mockImplementation(() => jest.fn());
jest.spyOn(global.console, 'error').mockImplementation(() => jest.fn());

jest.mock('nanoid', () => ({
  nanoid: () => '1',
}));

jest.mock('@udecode/plate-core', () => ({
  __esModule: true,
  ...jest.requireActual('@udecode/plate-core'),
}));

// jest.mock('@udecode/plate-core/react', () => ({
//   __esModule: true,
//   ...jest.requireActual('@udecode/plate-core/react'),
// }));
