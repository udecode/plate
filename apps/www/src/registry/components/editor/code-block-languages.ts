export type CodeBlockLanguageOption = Readonly<{
  aliases?: readonly string[];
  label: string;
  value: string;
}>;

export const codeBlockLanguages: readonly CodeBlockLanguageOption[] = [
  {
    aliases: ['plain', 'text', 'txt'],
    label: 'Plain Text',
    value: 'plaintext',
  },
  { label: 'ABAP', value: 'abap' },
  { label: 'Agda', value: 'agda' },
  { aliases: ['ino'], label: 'Arduino', value: 'arduino' },
  { label: 'ASCII Art', value: 'ascii' },
  { aliases: ['asm', 'x86'], label: 'Assembly', value: 'x86asm' },
  { aliases: ['sh', 'zsh'], label: 'Bash', value: 'bash' },
  { label: 'BASIC', value: 'basic' },
  { label: 'BNF', value: 'bnf' },
  { aliases: ['h'], label: 'C', value: 'c' },
  { aliases: ['c#', 'cs'], label: 'C#', value: 'csharp' },
  { aliases: ['c++', 'cc', 'cxx', 'hpp'], label: 'C++', value: 'cpp' },
  { aliases: ['clj', 'cljs', 'edn'], label: 'Clojure', value: 'clojure' },
  { aliases: ['coffee'], label: 'CoffeeScript', value: 'coffeescript' },
  { label: 'Coq', value: 'coq' },
  { label: 'CSS', value: 'css' },
  { label: 'Dart', value: 'dart' },
  { label: 'Dhall', value: 'dhall' },
  { aliases: ['patch'], label: 'Diff', value: 'diff' },
  { aliases: ['docker'], label: 'Docker', value: 'dockerfile' },
  { label: 'EBNF', value: 'ebnf' },
  { aliases: ['ex', 'exs'], label: 'Elixir', value: 'elixir' },
  { label: 'Elm', value: 'elm' },
  { aliases: ['erl'], label: 'Erlang', value: 'erlang' },
  { aliases: ['f#', 'fs'], label: 'F#', value: 'fsharp' },
  { label: 'Flow', value: 'flow' },
  { aliases: ['f90', 'f95'], label: 'Fortran', value: 'fortran' },
  { aliases: ['feature'], label: 'Gherkin', value: 'gherkin' },
  { label: 'GLSL', value: 'glsl' },
  { aliases: ['golang'], label: 'Go', value: 'go' },
  { aliases: ['gql'], label: 'GraphQL', value: 'graphql' },
  { label: 'Groovy', value: 'groovy' },
  { aliases: ['hs'], label: 'Haskell', value: 'haskell' },
  { aliases: ['terraform', 'tf'], label: 'HCL', value: 'hcl' },
  { aliases: ['htm', 'xhtml'], label: 'HTML', value: 'html' },
  { aliases: ['idr'], label: 'Idris', value: 'idris' },
  { label: 'Java', value: 'java' },
  {
    aliases: ['cjs', 'js', 'jsx', 'mjs'],
    label: 'JavaScript',
    value: 'javascript',
  },
  { aliases: ['jsonc'], label: 'JSON', value: 'json' },
  { aliases: ['jl'], label: 'Julia', value: 'julia' },
  { aliases: ['kt', 'kts'], label: 'Kotlin', value: 'kotlin' },
  { aliases: ['tex'], label: 'LaTeX', value: 'latex' },
  { label: 'Less', value: 'less' },
  { label: 'Lisp', value: 'lisp' },
  { aliases: ['ls'], label: 'LiveScript', value: 'livescript' },
  { aliases: ['ll'], label: 'LLVM IR', value: 'llvm' },
  { label: 'Lua', value: 'lua' },
  { aliases: ['make', 'mk'], label: 'Makefile', value: 'makefile' },
  { aliases: ['md', 'mdx'], label: 'Markdown', value: 'markdown' },
  { label: 'Markup', value: 'markup' },
  { label: 'MATLAB', value: 'matlab' },
  { aliases: ['mma', 'wl'], label: 'Mathematica', value: 'mathematica' },
  { aliases: ['mmd'], label: 'Mermaid', value: 'mermaid' },
  { label: 'Nix', value: 'nix' },
  { label: 'Notion Formula', value: 'notion' },
  {
    aliases: ['objc', 'objective-c'],
    label: 'Objective-C',
    value: 'objectivec',
  },
  { aliases: ['ml'], label: 'OCaml', value: 'ocaml' },
  { aliases: ['delphi', 'pas'], label: 'Pascal', value: 'pascal' },
  { aliases: ['pl', 'pm'], label: 'Perl', value: 'perl' },
  { label: 'PHP', value: 'php' },
  { aliases: ['ps1', 'pwsh'], label: 'PowerShell', value: 'powershell' },
  { label: 'Prolog', value: 'prolog' },
  { aliases: ['proto'], label: 'Protocol Buffers', value: 'protobuf' },
  { aliases: ['purs'], label: 'PureScript', value: 'purescript' },
  { aliases: ['py'], label: 'Python', value: 'python' },
  { label: 'R', value: 'r' },
  { aliases: ['rkt'], label: 'Racket', value: 'racket' },
  { aliases: ['re', 'reason'], label: 'Reason', value: 'reasonml' },
  { aliases: ['rb'], label: 'Ruby', value: 'ruby' },
  { aliases: ['rs'], label: 'Rust', value: 'rust' },
  { label: 'Scala', value: 'scala' },
  { aliases: ['scm'], label: 'Scheme', value: 'scheme' },
  { aliases: ['sass'], label: 'SCSS', value: 'scss' },
  { aliases: ['console'], label: 'Shell', value: 'shell' },
  { aliases: ['st'], label: 'Smalltalk', value: 'smalltalk' },
  { aliases: ['sol'], label: 'Solidity', value: 'solidity' },
  { label: 'SQL', value: 'sql' },
  { label: 'Swift', value: 'swift' },
  { label: 'TOML', value: 'toml' },
  {
    aliases: ['cts', 'mts', 'ts', 'tsx'],
    label: 'TypeScript',
    value: 'typescript',
  },
  { aliases: ['sv'], label: 'Verilog', value: 'verilog' },
  { label: 'VHDL', value: 'vhdl' },
  {
    aliases: ['vb', 'vb.net', 'visual basic', 'visualbasic'],
    label: 'Visual Basic',
    value: 'vbnet',
  },
  { aliases: ['wat'], label: 'WebAssembly', value: 'wasm' },
  { aliases: ['svg'], label: 'XML', value: 'xml' },
  { aliases: ['yml'], label: 'YAML', value: 'yaml' },
];

const canonicalLanguage = new Map<string, string>();

for (const { aliases = [], label, value } of codeBlockLanguages) {
  for (const key of [value, ...aliases, label]) {
    const normalized = key.toLowerCase();

    if (!canonicalLanguage.has(normalized)) {
      canonicalLanguage.set(normalized, value);
    }
  }
}

/**
 * Map a fence or picker language to its catalog value, such as `ts` to
 * `typescript`. An unknown language passes through lowercased, so custom
 * fences like `dot` keep their name.
 */
export function resolveCodeBlockLanguage(raw: string) {
  const language = raw.trim().toLowerCase();

  if (!language) return undefined;

  return canonicalLanguage.get(language) ?? language;
}

/**
 * Whether `option` names `lang` directly, through an alias, or through the
 * same catalog value, so CodeMirror's `c++` matches the catalog's `cpp`.
 */
export function matchesCodeBlockLanguage(
  lang: string,
  option: CodeBlockLanguageOption
) {
  return (
    option.value === lang ||
    Boolean(option.aliases?.includes(lang)) ||
    resolveCodeBlockLanguage(option.value) === resolveCodeBlockLanguage(lang)
  );
}

/** Whether a picker search `query` finds `option` by label, value or alias. */
export function matchesCodeBlockLanguageQuery(
  option: CodeBlockLanguageOption,
  query: string
) {
  const search = query.trim().toLowerCase();

  if (!search) return true;

  return (
    option.label.toLowerCase().includes(search) ||
    option.value.toLowerCase().includes(search) ||
    Boolean(
      option.aliases?.some((alias) => alias.toLowerCase().includes(search))
    ) ||
    resolveCodeBlockLanguage(option.value) === resolveCodeBlockLanguage(search)
  );
}

/**
 * Find the option for `lang` in `options`, then in `codeBlockLanguages`. An
 * exact value wins over an alias or catalog match.
 */
export function findCodeBlockLanguage(
  lang: string,
  options: readonly CodeBlockLanguageOption[] = []
) {
  for (const list of [options, codeBlockLanguages]) {
    const option =
      list.find((candidate) => candidate.value === lang) ??
      list.find((candidate) => matchesCodeBlockLanguage(lang, candidate));

    if (option) return option;
  }

  return undefined;
}

/** The label to show for a stored language, or the language itself when no option names it. */
export function getCodeBlockLanguageLabel(
  lang: string | null | undefined,
  options?: readonly CodeBlockLanguageOption[]
) {
  const value = lang?.trim();

  if (!value) return null;

  return findCodeBlockLanguage(value, options)?.label ?? value;
}

export const codeSyntaxClassName = [
  String.raw`**:[.hljs-keyword,.hljs-doctag,.hljs-template-tag,.hljs-template-variable,.hljs-type,.hljs-variable.language\_]:text-(--syntax-keyword)`,
  '**:[.hljs-attr,.hljs-attribute,.hljs-literal,.hljs-meta,.hljs-number,.hljs-operator,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-variable]:text-(--syntax-constant)',
  String.raw`**:[.hljs-built\_in,.hljs-symbol]:text-(--syntax-built-in)`,
  '**:[.hljs-bullet]:text-(--syntax-bullet)',
  '**:[.hljs-comment,.hljs-code,.hljs-formula]:text-(--syntax-comment)',
  '**:[.hljs-name,.hljs-quote,.hljs-selector-tag,.hljs-selector-pseudo]:text-(--syntax-tag)',
  '**:[.hljs-regexp,.hljs-string,.hljs-meta_.hljs-string]:text-(--syntax-string)',
  '**:[.hljs-section]:font-bold **:[.hljs-section]:text-(--syntax-section)',
  String.raw`**:[.hljs-title,.hljs-title.class\_,.hljs-title.class\_.inherited\_\_,.hljs-title.function\_]:text-(--syntax-title)`,
  '**:[.hljs-addition]:bg-(--syntax-addition-background) **:[.hljs-addition]:text-(--syntax-addition)',
  '**:[.hljs-deletion]:bg-(--syntax-deletion-background) **:[.hljs-deletion]:text-(--syntax-deletion)',
  '**:[.hljs-emphasis]:italic **:[.hljs-strong]:font-bold',
].join(' ');
