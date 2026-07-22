import { createBaseEditor } from '../../lib/editor';
import { createBasePlugin } from '../../lib/plugin';
import { isNominalPluginReference } from '../utils/mergePlugins';
import { getInjectedParserPluginProjections } from './getInjectedParserPluginProjections';

describe('getInjectedParserPluginProjections', () => {
  it('publishes parser-only overlays without manufacturing plugin identities', () => {
    const TargetPlugin = createBasePlugin({
      key: 'target',
      parser: { format: 'text/plain' },
    });
    const SourcePlugin = createBasePlugin({
      inject: {
        plugins: {
          target: {
            parser: { format: 'text/html' },
          },
        },
      },
      key: 'source',
    });
    const editor = createBaseEditor({
      plugins: [TargetPlugin, SourcePlugin],
    });
    const [projection] = getInjectedParserPluginProjections(
      editor,
      editor.getPlugin(TargetPlugin)
    );

    expect(projection).toBeDefined();
    expect(Object.keys(projection!)).toEqual([
      'inject',
      'key',
      'parser',
      'parsers',
    ]);
    expect(projection!.parser.format).toBe('text/html');
    expect(Object.isFrozen(projection)).toBe(true);
    expect(isNominalPluginReference(projection)).toBe(false);
  });
});
