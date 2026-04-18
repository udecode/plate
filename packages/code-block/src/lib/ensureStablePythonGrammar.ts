/* biome-ignore-all lint/performance/useTopLevelRegex: Vendored grammar keeps regex declarations local to mirror upstream structure. */

const STABLE_PYTHON_ALIASES = ['py', 'gyp', 'ipython'] as const;

const patchedLowlights = new WeakSet<object>();

function source(re: RegExp | string | null | undefined) {
  if (!re) return null;
  if (typeof re === 'string') return re;

  return re.source;
}

function lookahead(re: RegExp | string) {
  return concat('(?=', re, ')');
}

function concat(...args: (RegExp | string | null | undefined)[]) {
  return args.map((value) => source(value)).join('');
}

// Adapted from the older Highlight.js Python grammar.
// The current 11.x grammar uses unicodeRegex + multi-match rules that can
// generate invalid regex ranges in the browser bundle, while this version stays
// stable across SSR and hydration.
function pythonBrowserSafe(hljs: any) {
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

  const keywords = {
    $pattern: /[A-Za-z]\w+|__\w+__/,
    built_in: builtIns,
    keyword: reservedWords,
    literal: literals,
    type: types,
  };

  const prompt = {
    begin: /^(>>>|\.\.\.) /,
    className: 'meta',
  };

  const subst: any = {
    begin: /\{/,
    className: 'subst',
    end: /\}/,
    illegal: /#/,
    keywords,
  };

  const literalBracket = {
    begin: /\{\{/,
    relevance: 0,
  };

  const string = {
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

  const number = {
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

  const commentType = {
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

  const params = {
    className: 'params',
    variants: [
      {
        begin: /\(\s*\)/,
        className: '',
        skip: true,
      },
      {
        begin: /\(/,
        contains: ['self', prompt, number, string, hljs.HASH_COMMENT_MODE],
        end: /\)/,
        excludeBegin: true,
        excludeEnd: true,
        keywords,
      },
    ],
  };

  subst.contains = [string, number, prompt];

  return {
    aliases: [...STABLE_PYTHON_ALIASES],
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
}

export const ensureStablePythonGrammar = (
  lowlight:
    | {
        register?: (name: string, grammar: any) => void;
        registerAlias?: (language: string, alias: string[]) => void;
      }
    | null
    | undefined,
  language: string | null | undefined
) => {
  if (language !== 'python' || !lowlight || patchedLowlights.has(lowlight)) {
    return;
  }

  if (typeof lowlight.register !== 'function') return;

  lowlight.register('python', pythonBrowserSafe);

  if (typeof lowlight.registerAlias === 'function') {
    lowlight.registerAlias('python', [...STABLE_PYTHON_ALIASES]);
  }

  patchedLowlights.add(lowlight);
};
