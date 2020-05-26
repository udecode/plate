import { Decorate } from 'common/types';
import { NodeEntry } from 'slate';
import { decoratePlugins } from 'components/EditablePlugins/utils';

const nodeEntry: NodeEntry = [{ text: 'test' }, [0, 0]];
const decorateEmpty: Decorate = () => [];

const output: any = [];

it('should be empty', () => {
  expect(decoratePlugins([], [])(nodeEntry)).toEqual(output);
  expect(decoratePlugins([{}], [])(nodeEntry)).toEqual(output);
  expect(decoratePlugins([], [decorateEmpty])(nodeEntry)).toEqual(output);
});
