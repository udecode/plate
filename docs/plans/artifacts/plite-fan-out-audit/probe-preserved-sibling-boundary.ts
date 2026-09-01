import { readFileSync } from 'node:fs';

Bun.plugin({
  name: 'fanout-preserved-sibling-boundary-counterfactual',
  setup(builder) {
    builder.onLoad({ filter: /\/core\/change\/root-change\.ts$/ }, ({ path }) => {
      const source = readFileSync(path, 'utf8');
      const current = 'if (suffix > 0 && source.length !== target.length) displaced = true;';
      if (!source.includes(current)) throw new Error('Sibling-boundary probe no longer matches');
      const marker = '    const targetCount = targetEnd - prefix;';
      const textBoundaries = `
    if (sourceCount > 0 && targetCount > 0 && sourceCount !== targetCount && (sourceCount === 1 || targetCount === 1)) {
      const sourceRun = source.slice(prefix, sourceEnd);
      const targetRun = target.slice(prefix, targetEnd);
      if (sourceRun.every(isTextNode) && targetRun.every(isTextNode) && sourceRun.map(node => node.text).join('') === targetRun.map(node => node.text).join('')) {
        addPropertyChanges(sourceRun[0], targetRun[0], [...parentPath, prefix]);
        if (targetCount === 1) {
          for (let index = prefix + 1; index < sourceEnd; index++) {
            const boundary = before.childPosition(parentPath, index);
            changes.push({ from: boundary - 1, to: boundary + 1 });
          }
        } else {
          let offset = targetRun[0].text.length;
          for (let index = 1; index < targetRun.length; index++) {
            changes.push({ from: before.positionAt({ path: [...parentPath, prefix], offset }), insert: PreparedTokenSlice.fromTokens([closeToken('text'), openToken('text', getProperties(targetRun[index]))]) });
            offset += targetRun[index].text.length;
          }
        }
        displaced = true;
        return true;
      }
    }
`;
      return {
        contents: source.replace(current, 'if (suffix > 0 && source.length !== target.length && (source.length === prefix + suffix || target.length === prefix + suffix)) displaced = true;').replace(marker, marker + textBoundaries),
        loader: 'ts',
      };
    });
  },
});
