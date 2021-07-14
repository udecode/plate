import '@testing-library/jest-dom/extend-expect';

jest.spyOn(global.console, 'warn').mockImplementation(() => jest.fn());
