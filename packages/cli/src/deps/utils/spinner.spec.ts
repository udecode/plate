import { afterAll, afterEach, describe, expect, it, mock } from 'bun:test';

const oraMock = mock((options: unknown) => options);

mock.module('ora', () => ({
  default: oraMock,
}));

const loadModule = async () =>
  import(`./spinner?test=${Math.random().toString(36).slice(2)}`);

describe('spinner', () => {
  afterEach(() => {
    oraMock.mockClear();
  });

  afterAll(() => {
    mock.restore();
  });

  it('passes text and silent mode through to ora', async () => {
    const { spinner } = await loadModule();

    const result = spinner('Working', { silent: true });

    expect(oraMock).toHaveBeenCalledWith({
      isSilent: true,
      text: 'Working',
    });
    expect(result).toEqual({
      isSilent: true,
      text: 'Working',
    });
  });

  it('defaults to a visible spinner when silent is omitted', async () => {
    const { spinner } = await loadModule();

    spinner('Visible');

    expect(oraMock).toHaveBeenCalledWith({
      isSilent: undefined,
      text: 'Visible',
    });
  });
});
