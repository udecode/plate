import { fixtures } from '__test-utils__/fixtures';
import { FixtureEditor } from '__test-utils__/types';

describe('slate-deserializers', () => {
  fixtures(
    __dirname,
    'editors',
    ({ module: { run, input, output } }: FixtureEditor) => {
      const inp = input?.operations ? input.children : input;
      const out = output?.operations ? output.children : output;

      expect(run(inp)).toEqual(out);
    }
  );
});
