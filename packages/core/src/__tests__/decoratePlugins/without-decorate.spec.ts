import { NodeEntry } from 'slate';
import { Decorate } from '../../types';
import { decoratePlugins } from '../../utils';

const nodeEntry: NodeEntry = [{ text: 'test' }, [0, 0]];
const decorateEmpty: Decorate = () => [];

const output: any = [];

it('should be empty', () => {
  expect(decoratePlugins({} as any, [], [])(nodeEntry)).toEqual(output);
  expect(decoratePlugins({} as any, [{}], [])(nodeEntry)).toEqual(output);
  expect(decoratePlugins({} as any, [], [decorateEmpty])(nodeEntry)).toEqual(
    output
  );
});
