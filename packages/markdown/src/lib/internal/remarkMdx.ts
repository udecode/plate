import type {
  Code,
  Construct,
  Effects,
  Extension,
  ParseContext,
  State,
} from 'micromark-util-types';
import type { Plugin, Processor } from 'unified';

import baseRemarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { mdxFromMarkdown, mdxToMarkdown } from 'mdast-util-mdx';
import { mdxjs } from 'micromark-extension-mdxjs';
import { createMdxDocument, nativeAutolink as native } from './mdxSyntax';
import { htmlToJsx } from '../deserializer/utils/htmlToJsx';
import { legacyHtmlToJsx } from './legacyHtmlToJsx';
import { createMdxContext, createMdxSource } from './mdxContext';

type Options = Parameters<typeof baseRemarkMdx>[0];
type Grammar = Pick<
  NonNullable<Options>,
  'acorn' | 'acornOptions' | 'addResult'
>;
type CapturedGrammar = { -readonly [Key in keyof Grammar]: Grammar[Key] };
type Document = ReturnType<typeof createMdxDocument>;
type Owner = {
  options: CapturedGrammar;
};
type Scope = { owners: Owner[]; parser: Processor['parser'] };
const scopes = new WeakMap<object, Scope>();

const parses = new WeakMap<ParseContext, Map<Owner, Document>>();

function wrapNativeConstruct(construct: Construct, owner: Owner): Construct {
  const tokenize = construct.tokenize;
  const name = construct.name;
  if (name === 'mdxJsxTextTag') {
    construct.tokenize = function (effects, ok, nok) {
      const document = parses.get(this.parser)?.get(owner);
      if (!document) return tokenize.call(this, effects, ok, nok);
      return document.classify(this.now(), this).kind === 'autolink'
        ? native.tokenize.call(this, effects, ok, nok)
        : tokenize.call(this, effects, ok, nok);
    };
  }
  if (name === 'mdxJsxFlowTag') {
    construct.tokenize = function (effects, ok, nok) {
      const document = parses.get(this.parser)?.get(owner);
      if (!document) return tokenize.call(this, effects, ok, nok);
      const context = this;
      const owned = Symbol('ownedAutolink');
      let finished = false;
      const terminal =
        (continuation: State): State =>
        (code) => {
          finished = true;
          return continuation(code);
        };
      const adapted: Effects = {
        ...effects,
        enter(type, ...rest) {
          if (
            type === 'mdxJsxFlowTag' &&
            document.classify(context.now(), context).kind === 'autolink'
          )
            throw owned;
          return effects.enter(type, ...rest);
        },
      };
      let state = tokenize.call(context, adapted, terminal(ok), terminal(nok));
      function step(code: Code): ReturnType<State> {
        try {
          const next = state(code);
          if (finished || !next) return next;
          state = next;
          return step;
        } catch (error) {
          if (error === owned) return nok(code);
          throw error;
        }
      }
      return step;
    };
  }
  return construct;
}

function createParseExtensions(
  source: string,
  extensions: Extension[],
  owners: Owner[]
): Extension[] {
  const indexed = createMdxSource(source);
  const documents = new Map<Owner, Document>();
  const contextOwner = createMdxContext(indexed, (parser) =>
    parses.set(parser, documents)
  );
  for (const owner of owners)
    documents.set(
      owner,
      createMdxDocument(indexed, owner.options, (context) =>
        contextOwner.view(context)
      )
    );
  return [contextOwner.observer, ...extensions, contextOwner.initializer];
}

export const setupMarkdownParser: Plugin = function () {
  const parse = this.parser;
  if (!parse) return;
  const scope: Scope = { owners: [], parser: undefined };
  this.parser = (source, file) => {
    const owners = scope.owners.filter(
      (owner) => !Object.hasOwn(owner.options, 'acorn')
    );
    if (!owners.length) return parse(source, file);
    const settings = { ...this.data('settings') };
    const extensions = this.data('micromarkExtensions') || [];
    const fromMarkdownExtensions = this.data('fromMarkdownExtensions') || [];
    return unified()
      .data({
        settings,
        fromMarkdownExtensions,
        micromarkExtensions: createParseExtensions(source, extensions, owners),
      })
      .use(remarkParse)
      .parse(source);
  };
  scope.parser = this.parser;
  scopes.set(this, scope);
};

export const attachMdx: typeof baseRemarkMdx = function (options) {
  const scope = scopes.get(this);
  if (!scope) return baseRemarkMdx.call(this, options);
  const captured: CapturedGrammar = {};
  let attaching = true;
  const observed =
    options &&
    new Proxy(
      {},
      {
        ownKeys() {
          return Reflect.ownKeys(options);
        },
        getOwnPropertyDescriptor(_target, key) {
          const descriptor = Reflect.getOwnPropertyDescriptor(options, key);
          return descriptor && { ...descriptor, configurable: true };
        },
        get(_target, key) {
          const value = Reflect.get(options, key, options);
          if (!attaching) return value;
          if (key === 'acorn') captured.acorn = value;
          if (key === 'addResult') captured.addResult = value;
          if (key !== 'acornOptions') return value;
          if (
            !value ||
            (typeof value !== 'object' && typeof value !== 'function')
          ) {
            captured.acornOptions = value;
            return value;
          }
          let settings: NonNullable<NonNullable<Options>['acornOptions']> = {
            ecmaVersion: 2024,
          };
          captured.acornOptions = settings;
          return new Proxy(
            {},
            {
              ownKeys() {
                const keys = Reflect.ownKeys(value);
                settings = { ecmaVersion: 2024 };
                captured.acornOptions = settings;
                return keys;
              },
              getOwnPropertyDescriptor(_shadow, name) {
                const descriptor = Reflect.getOwnPropertyDescriptor(
                  value,
                  name
                );
                return descriptor && { ...descriptor, configurable: true };
              },
              get(_shadow, name) {
                const setting = Reflect.get(value, name, value);
                if (attaching) Reflect.set(settings, name, setting);
                return setting;
              },
            }
          );
        },
      }
    );
  const data = this.data();
  let syntax = data.micromarkExtensions;
  if (!syntax) {
    syntax = [];
    data.micromarkExtensions = syntax;
  }
  let from = data.fromMarkdownExtensions;
  if (!from) {
    from = [];
    data.fromMarkdownExtensions = from;
  }
  let to = data.toMarkdownExtensions;
  if (!to) {
    to = [];
    data.toMarkdownExtensions = to;
  }
  const appendSyntax = syntax.push;
  let extension: Extension;
  try {
    extension = mdxjs(observed);
  } finally {
    attaching = false;
  }
  const owner: Owner = { options: captured };
  for (const kind of ['text', 'flow'] as const) {
    const record = extension[kind];
    const value = record?.[60];
    if (record && value)
      record[60] = Array.isArray(value)
        ? value.map((construct) => wrapNativeConstruct(construct, owner))
        : wrapNativeConstruct(value, owner);
  }
  Reflect.apply(appendSyntax, syntax, [extension]);
  const appendFrom = from.push;
  Reflect.apply(appendFrom, from, [mdxFromMarkdown()]);
  const appendTo = to.push;
  Reflect.apply(appendTo, to, [mdxToMarkdown(options || {})]);
  scope.owners.push(owner);
};

export function normalizeProcessorHtml(
  processor: { freeze(): unknown; parser?: unknown },
  source: string
): string {
  processor.freeze();
  const scope = scopes.get(processor);
  return scope && scope.parser === processor.parser
    ? htmlToJsx(source)
    : legacyHtmlToJsx(source);
}

export const replaceRawMdx = (plugin: Plugin) =>
  plugin === baseRemarkMdx ? attachMdx : plugin;
