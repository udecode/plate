import type { Plugin } from 'unified';
import type { Construct, Extension } from 'micromark-util-types';

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import nativeMdx from 'remark-mdx';

import { createTestEditor } from '../__tests__/createTestEditor';
import {
  deserializeMd,
  markdownToAstProcessor,
} from '../deserializer/deserializeMd';
import { remarkMdx } from './remarkMdx';

it('does not inspect an unused caller construct', () => {
  const opaque: Plugin = function () {
    const original: Construct = {
      tokenize(_effects, _ok, nok) {
        return nok;
      },
    };
    const construct = new Proxy(original, {
      getOwnPropertyDescriptor() {
        throw new Error('Caller descriptor inspection');
      },
    });
    const data = this.data();
    data.micromarkExtensions ??= [];
    data.micromarkExtensions.push({ text: { 33: construct } });
  };
  const input = '<u>keep</u>\n\nAfter';
  expect(
    markdownToAstProcessor(createTestEditor(), input, {
      remarkPlugins: [remarkMdx, opaque],
    })
  ).toEqual(unified().use(remarkParse).use(nativeMdx).use(opaque).parse(input));
  const errors: Error[] = [];
  expect(
    deserializeMd(createTestEditor(), input, {
      remarkPlugins: [remarkMdx, opaque],
      onError: (error) => errors.push(error),
    })
  ).toEqual([
    { type: 'p', children: [{ text: 'keep', underline: true }] },
    { type: 'p', children: [{ text: 'After' }] },
  ]);
  expect(errors).toEqual([]);
});

it('keeps a caller proxy replacement tokenizer authoritative', () => {
  const replace: Plugin = function () {
    const extension = this.data().micromarkExtensions?.at(-1);
    if (!extension) throw new Error('MDX extension missing');
    const reject: Construct['tokenize'] = (_effects, _ok, nok) => nok;
    for (const record of [extension.text, extension.flow]) {
      const value = record?.[60];
      if (!record || !value) continue;
      record[60] = (Array.isArray(value) ? value : [value]).map(
        (construct) =>
          new Proxy(construct, {
            get(target, key, receiver) {
              return key === 'tokenize'
                ? reject
                : Reflect.get(target, key, receiver);
            },
          })
      );
    }
  };
  const input = '<a@example.com>\n\nAfter';
  expect(
    markdownToAstProcessor(createTestEditor(), input, {
      remarkPlugins: [remarkMdx, replace],
    })
  ).toEqual(
    unified().use(remarkParse).use(nativeMdx).use(replace).parse(input)
  );
  expect(
    deserializeMd(createTestEditor(), input, {
      remarkPlugins: [remarkMdx, replace],
    })
  ).toEqual([
    { type: 'p', children: [{ text: '<a@example.com>' }] },
    { type: 'p', children: [{ text: 'After' }] },
  ]);
});

it('uses the JSX option copy when earlier copies delete a setting', () => {
  const options = () => {
    const acornOptions: NonNullable<
      NonNullable<Parameters<typeof remarkMdx>[0]>['acornOptions']
    > = {
      ecmaVersion: 2024,
      get sourceType() {
        delete this.sourceType;
        return 'script' as const;
      },
    };
    return { acornOptions };
  };
  const configured: Plugin = function () {
    remarkMdx.call(this, options());
  };
  const baseline: Plugin = function () {
    nativeMdx.call(this, options());
  };
  const input = '<u{...await/*@example.com>*/x}>keep</u>\n\nAfter';
  expect(
    markdownToAstProcessor(createTestEditor(), input, {
      remarkPlugins: [configured],
    })
  ).toEqual(unified().use(remarkParse).use(baseline).parse(input));
  expect(
    deserializeMd(createTestEditor(), input, { remarkPlugins: [configured] })
  ).toEqual([
    { type: 'p', children: [{ text: 'keep', underline: true }] },
    { type: 'p', children: [{ text: 'After' }] },
  ]);
});

it('keeps a successful new list item when its previous child flow closes', () => {
  const input =
    '- item\n- > <u{/*@example.com>*/...a\n  > > b}>keep</u>\n\nAfter';
  expect(markdownToAstProcessor(createTestEditor(), input)).toEqual(
    unified().use(remarkParse).use(nativeMdx).parse(input)
  );
});

it('lets native combination ignore a hidden flow hook', () => {
  const hide: Plugin = function () {
    const extension = this.data().micromarkExtensions?.at(-1);
    if (!extension) throw new Error('MDX extension missing');
    Object.defineProperty(extension, 'flow', { enumerable: false });
  };
  const input = '<A />';
  expect(
    markdownToAstProcessor(createTestEditor(), input, {
      remarkPlugins: [remarkMdx, hide],
    })
  ).toEqual(unified().use(remarkParse).use(nativeMdx).use(hide).parse(input));
});

it('keeps the native append callback when an option getter changes it', () => {
  let append: Extension[]['push'] = Array.prototype.push;
  const namespace: Plugin = function () {
    const syntax: Extension[] = [];
    Object.defineProperty(syntax, 'push', { get: () => append });
    this.data('micromarkExtensions', syntax);
  };
  const options = (): NonNullable<Parameters<typeof remarkMdx>[0]> => ({
    acornOptions: {
      get ecmaVersion() {
        append = () => {
          throw new Error('Append selected after native factory');
        };
        return 2024 as const;
      },
    },
  });
  const baseline: Plugin = function () {
    nativeMdx.call(this, options());
  };
  const configured: Plugin = function () {
    remarkMdx.call(this, options());
  };
  const input = '<u>keep</u>\n\nAfter';
  const expected = unified()
    .use(remarkParse)
    .use(namespace)
    .use(baseline)
    .parse(input);
  append = Array.prototype.push;
  expect(
    markdownToAstProcessor(createTestEditor(), input, {
      remarkPlugins: [namespace, configured],
    })
  ).toEqual(expected);
});

const copyConstructs: Plugin = function () {
  const extension = this.data().micromarkExtensions?.at(-1);
  if (!extension) throw new Error('MDX extension missing');
  for (const record of [extension.text, extension.flow]) {
    const value = record?.[60];
    if (record && value)
      record[60] = [value].flat().map((construct) => ({ ...construct }));
  }
};

it('preserves formatting and later content when a plugin copies constructs', () => {
  const input = '<u{/*@example.com>*/...a\n> b}>keep</u>\n\nAfter';
  expect(
    deserializeMd(createTestEditor(), input, {
      remarkPlugins: [remarkMdx, copyConstructs],
    })
  ).toEqual([
    { type: 'p', children: [{ text: 'keep', underline: true }] },
    { type: 'p', children: [{ text: 'After' }] },
  ]);
});

it('preserves expression-to-JSX flow when a plugin copies constructs', () => {
  expect(
    markdownToAstProcessor(createTestEditor(), '{x}<u />\nAfter', {
      remarkPlugins: [remarkMdx, copyConstructs],
    }).children.map((node) => node.type)
  ).toEqual(['mdxFlowExpression', 'mdxJsxFlowElement', 'paragraph']);
});
