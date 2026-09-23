import { all, createLowlight, type LanguageFn } from 'lowlight';

type HighlightMode = ReturnType<LanguageFn>['contains'][number];
type HighlightLanguage = ReturnType<LanguageFn>;
type HighlightJs = Parameters<LanguageFn>[0];
/*
 * Adapted from Highlight.js 10.7.3 Python grammar.
 * BSD 3-Clause License
 *
 * Copyright (c) 2006, Ivan Sagalaev.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * * Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const stablePythonAliases = ['py', 'gyp', 'ipython'] as const;
const source = (value: RegExp | string | null | undefined) => {
  if (!value) return null;

  return typeof value === 'string' ? value : value.source;
};
const concat = (...values: Array<RegExp | string | null | undefined>) =>
  values.map((value) => source(value)).join('');
const lookahead = (value: RegExp | string) => concat('(?=', value, ')');

// Adapted from the older Highlight.js Python grammar. The current 11.x
// grammar uses unicodeRegex + multi-match rules that can generate invalid
// regex ranges in browser bundles.
// The shipped native kit registers this grammar before highlighting begins.
const pythonBrowserSafe = (hljs: HighlightJs): HighlightLanguage => {
  const reservedWords = [
    'and',
    'as',
    'assert',
    'async',
    'await',
    'break',
    'case',
    'class',
    'continue',
    'def',
    'del',
    'elif',
    'else',
    'except',
    'finally',
    'for',
    'from',
    'global',
    'if',
    'import',
    'in',
    'is',
    'lambda',
    'match',
    'nonlocal|10',
    'not',
    'or',
    'pass',
    'raise',
    'return',
    'try',
    'while',
    'with',
    'yield',
  ];
  const builtIns = [
    '__import__',
    'abs',
    'all',
    'any',
    'ascii',
    'bin',
    'bool',
    'breakpoint',
    'bytearray',
    'bytes',
    'callable',
    'chr',
    'classmethod',
    'compile',
    'complex',
    'delattr',
    'dict',
    'dir',
    'divmod',
    'enumerate',
    'eval',
    'exec',
    'filter',
    'float',
    'format',
    'frozenset',
    'getattr',
    'globals',
    'hasattr',
    'hash',
    'help',
    'hex',
    'id',
    'input',
    'int',
    'isinstance',
    'issubclass',
    'iter',
    'len',
    'list',
    'locals',
    'map',
    'max',
    'memoryview',
    'min',
    'next',
    'object',
    'oct',
    'open',
    'ord',
    'pow',
    'print',
    'property',
    'range',
    'repr',
    'reversed',
    'round',
    'set',
    'setattr',
    'slice',
    'sorted',
    'staticmethod',
    'str',
    'sum',
    'super',
    'tuple',
    'type',
    'vars',
    'zip',
  ];
  const literals = [
    '__debug__',
    'Ellipsis',
    'False',
    'None',
    'NotImplemented',
    'True',
  ];
  const types = [
    'Any',
    'Callable',
    'Coroutine',
    'Dict',
    'List',
    'Literal',
    'Generic',
    'Optional',
    'Sequence',
    'Set',
    'Tuple',
    'Type',
    'Union',
  ];
  const keywords: NonNullable<HighlightMode['keywords']> = {
    $pattern: String.raw`[A-Za-z]\w+|__\w+__`,
    built_in: builtIns,
    keyword: reservedWords,
    literal: literals,
    type: types,
  };
  const prompt: HighlightMode = {
    begin: /^(>>>|\.\.\.) /,
    className: 'meta',
  };
  const subst: HighlightMode = {
    begin: /\{/,
    className: 'subst',
    end: /\}/,
    illegal: /#/,
    keywords,
  };
  const literalBracket: HighlightMode = {
    begin: /\{\{/,
    relevance: 0,
  };
  const string: HighlightMode = {
    className: 'string',
    contains: [hljs.BACKSLASH_ESCAPE],
    variants: [
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?'''/,
        contains: [hljs.BACKSLASH_ESCAPE, prompt],
        end: /'''/,
        relevance: 10,
      },
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?"""/,
        contains: [hljs.BACKSLASH_ESCAPE, prompt],
        end: /"""/,
        relevance: 10,
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])'''/,
        contains: [hljs.BACKSLASH_ESCAPE, prompt, literalBracket, subst],
        end: /'''/,
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])"""/,
        contains: [hljs.BACKSLASH_ESCAPE, prompt, literalBracket, subst],
        end: /"""/,
      },
      {
        begin: /([uU]|[rR])'/,
        end: /'/,
        relevance: 10,
      },
      {
        begin: /([uU]|[rR])"/,
        end: /"/,
        relevance: 10,
      },
      {
        begin: /([bB]|[bB][rR]|[rR][bB])'/,
        end: /'/,
      },
      {
        begin: /([bB]|[bB][rR]|[rR][bB])"/,
        end: /"/,
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])'/,
        contains: [hljs.BACKSLASH_ESCAPE, literalBracket, subst],
        end: /'/,
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])"/,
        contains: [hljs.BACKSLASH_ESCAPE, literalBracket, subst],
        end: /"/,
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
    ],
  };
  const digitPart = '[0-9](_?[0-9])*';
  const pointFloat = `(\\b(${digitPart}))?\\.(${digitPart})|\\b(${digitPart})\\.`;
  const number: HighlightMode = {
    className: 'number',
    relevance: 0,
    variants: [
      {
        begin: `(\\b(${digitPart})|(${pointFloat}))[eE][+-]?(${digitPart})[jJ]?\\b`,
      },
      {
        begin: `(${pointFloat})[jJ]?`,
      },
      {
        begin: '\\b([1-9](_?[0-9])*|0+(_?0)*)[lLjJ]?\\b',
      },
      {
        begin: '\\b0[bB](_?[01])+[lL]?\\b',
      },
      {
        begin: '\\b0[oO](_?[0-7])+[lL]?\\b',
      },
      {
        begin: '\\b0[xX](_?[0-9a-fA-F])+[lL]?\\b',
      },
      {
        begin: `\\b(${digitPart})[jJ]\\b`,
      },
    ],
  };
  const commentType: HighlightMode = {
    begin: lookahead(/# type:/),
    className: 'comment',
    contains: [
      {
        begin: /# type:/,
      },
      {
        begin: /#/,
        end: /\b\B/,
        endsWithParent: true,
      },
    ],
    end: /$/,
    keywords,
  };
  const params: HighlightMode = {
    className: 'params',
    variants: [
      {
        begin: /\(\s*\)/,
        className: '',
        skip: true,
      },
      {
        begin: /\(/,
        contains: [
          { begin: /\bself\b/ },
          prompt,
          number,
          string,
          hljs.HASH_COMMENT_MODE,
        ],
        end: /\)/,
        excludeBegin: true,
        excludeEnd: true,
        keywords,
      },
    ],
  };

  subst.contains = [string, number, prompt];

  return {
    aliases: [...stablePythonAliases],
    contains: [
      prompt,
      number,
      {
        begin: /\bself\b/,
      },
      {
        beginKeywords: 'if',
        relevance: 0,
      },
      string,
      commentType,
      hljs.HASH_COMMENT_MODE,
      {
        contains: [
          hljs.UNDERSCORE_TITLE_MODE,
          params,
          {
            begin: /->/,
            endsWithParent: true,
            keywords,
          },
        ],
        end: /:/,
        illegal: /[${=;\n,]/,
        variants: [
          {
            beginKeywords: 'def',
            className: 'function',
          },
          {
            beginKeywords: 'class',
            className: 'class',
          },
        ],
      },
      {
        begin: /^[\t ]*@/,
        className: 'meta',
        contains: [number, params, string],
        end: /(?=#)|$/,
      },
    ],
    illegal: /(<\/|->|\?)|=>/,
    keywords,
    name: 'Python',
  };
};

export const createCodeBlockLowlight = () => {
  const lowlight = createLowlight(all);

  lowlight.register('python', pythonBrowserSafe);
  lowlight.registerAlias('python', stablePythonAliases);

  return lowlight;
};
