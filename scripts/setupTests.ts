import '@testing-library/jest-dom/extend-expect';
import 'slate-test-utils/dist/cjs/mocks';

jest.spyOn(global.console, 'warn').mockImplementation(() => jest.fn());
