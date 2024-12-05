import type { AnyObject, TText, UnknownObject } from '@udecode/plate-common';
import type { PlatePluginContext } from '@udecode/plate-common/react';
import type { Range, RangeRef } from 'slate';

// ─── Plate ──────────────────────────────────────────────────────────────────

export type LintDecoration = TText & {
  lint: boolean;
  token: LintToken;
};

export type LintToken = {
  range: Range;
  rangeRef: RangeRef;
  text: string;
  data?: UnknownObject;
  messageId?: string;
  suggest?: LintTokenSuggestion[];
};

export type LintTokenSuggestion = {
  fix: (options?: { goNext?: boolean }) => void;
  data?: Record<string, any>;
  messageId?: string;
};

// ─── Config ──────────────────────────────────────────────────────────────────
export type LintConfigArray = LintConfigObject[];

export type LintConfigObject<T = {}> = {
  /** Language-specific options for parsing and processing */
  languageOptions?: LintLanguageOptions<T>;
  /** An object containing settings related to the linting process. */
  linterOptions?: AnyObject;
  /**
   * A name for the configuration object. This is used in error messages and
   * config inspector to help identify which configuration object is being
   * used.
   */
  name?: string;
  /**
   * An object containing a name-value mapping of plugin names to plugin
   * objects.
   */
  plugins?: LintConfigPlugins;
  /**
   * An object containing the configured rules. These rule configurations are
   * only available to the matching targets
   */
  rules?: LintConfigRules;
  /**
   * An object containing name-value pairs of information that should be
   * available to all rules.
   */
  settings?: LintConfigRuleOptions<Partial<T>>;
  /** The targets to match. */
  targets?: { id?: string }[];
};

export type LintConfigRuleOptions<T = {}> = T & UnknownObject;

export type LintConfigRuleOptionsArray<T = {}> = [
  LintConfigRuleOptions<T>,
  ...LintConfigRuleOptions[],
];

export type LintTokenOptions = {
  tokens?: {
    match?: (token: string) => boolean;
    splitPattern?: RegExp;
  };
};

// ─── Config Rules ─────────────────────────────────────────────────────────────

export type LintConfigRule =
  | LintConfigRuleLevel
  | LintConfigRuleLevelAndOptions;

export type LintConfigRuleLevel =
  | LintConfigRuleSeverity
  | LintConfigRuleSeverityString;

export type LintConfigRuleLevelAndOptions = [LintConfigRuleLevel, ...unknown[]];

export type LintConfigRules = Partial<Record<string, LintConfigRule>>;

export type LintConfigRuleSeverity = 0 | 1 | 2;

export type LintConfigRuleSeverityString = 'error' | 'off' | 'warn';

// ─── Config Plugin ────────────────────────────────────────────────────────────

export type LintConfigPlugin<T = {}> = {
  /**
   * The definition of plugin rules. The key must be the name of the rule that
   * users will use. Users can stringly reference the rule using the key they
   * registered the plugin under combined with the rule name. i.e. for the user
   * config `plugins: { foo: pluginReference }` - the reference would be
   * `"foo/ruleName"`.
   */
  rules: Record<string, LintConfigPluginRule>;
  meta?: {
    name?: string;
    version?: string;
  };
  configs?: Record<string, LintConfigObject<T>>;
};

export type LintConfigPluginRule<T = {}> = {
  /**
   * Returns an object with methods that the linter calls to process text tokens
   * while traversing the document during decoration.
   */
  create: (context: LintConfigPluginRuleContext<T>) => {
    /** A function that transforms a token. */
    Token: (token: LintToken) => LintToken;
  };
  meta: {
    docs?: {
      description?: string;
    };
    /**
     * Specifies default options for the rule. If present, any user-provided
     * options in their config will be merged on top of them recursively.
     */
    defaultOptions?: LintConfigRuleOptionsArray<Partial<T>>;
    hasSuggestions?: boolean;
    /** Overrides the language options for the rule. */
    languageOptions?: LintLanguageOptions<T>;
    messages?: Record<string, string>;
    type?: 'problem' | 'suggestion';
  };
};

export type LintConfigPluginRuleContext<T = {}> = Pick<
  ResolvedLintRule<T>,
  'languageOptions' | 'options' | 'settings'
> & {
  /** The id of the rule. */
  id: string;
  /** A function that fixes the linting issue. */
  fixer: LintFixer;
} & PlatePluginContext;

export type LintConfigPluginRules = Record<string, LintConfigPluginRule>;

export type LintConfigPlugins = Record<string, LintConfigPlugin>;

export type LintFixer = {
  insertTextAfter: ({ range, text }: { range: Range; text: string }) => void;
  insertTextBefore: ({ range, text }: { range: Range; text: string }) => void;
  remove: ({ range }: { range: Range }) => void;
  replaceText: ({ range, text }: { range: Range; text: string }) => void;
};

// ─── Parser ──────────────────────────────────────────────────────────────────

export type LintParserContext = {
  /** Custom token position calculator */
  getTokenPosition: (token: string, text: string) => number;
  /** Custom token context checker */
  isValidTokenContext: (position: number, text: string) => boolean;
  /** Full text content for context-aware matching */
  text: string;
};

export type LintParserOptions = {
  context?: LintParserContext;
  /** Function to determine if a token should be processed */
  match?: (token: string) => boolean;
  /** Maximum length of tokens to process */
  maxLength?: number;
  /** Minimum length of tokens to process */
  minLength?: number;
  /** Pattern for splitting text into tokens */
  splitPattern?: RegExp;
};

// Add new language options types
export type LintLanguageOptions<T = {}> = T & {
  /** Custom parser implementation */
  // parser?: typeof findRanges;
  /** Parser-specific options */
  parserOptions?:
    | ((context: LintConfigPluginRuleContext<T>) => LintParserOptions)
    | LintParserOptions;
};

// ─── Resolved Rules ────────────────────────────────────────────────────────────

export type ResolvedLintRule<T = {}> = Pick<
  LintConfigPluginRule,
  'create' | 'meta'
> &
  Pick<LintConfigObject<T>, 'languageOptions' | 'settings' | 'targets'> & {
    languageOptions: {
      parserOptions?: LintParserOptions;
    };
    linterOptions: {
      severity: LintConfigRuleSeverityString;
    };
    context: LintConfigPluginRuleContext<T>;
    name: string;
    /**
     * An array of the configured options for this rule. This array does not
     * include the rule severity.
     */
    options: LintConfigRuleOptionsArray<T>;
  };

export type ResolvedLintRules = Record<string, ResolvedLintRule>;

// export type LintAnalysisType =
//   | 'word'        // Single words (like emoji matching)
//   | 'phrase'      // Multiple words (like grammar checking)
//   | 'sentence'    // Full sentences (like style suggestions)
//   | 'paragraph'   // Whole paragraphs (like structure analysis)
//   | 'custom';     // Custom analysis

// export type LintParserOptions = {
//   /** Type of analysis to perform */
//   analysisType?: LintAnalysisType;
//   /** Custom pattern for token extraction */
//   pattern?: RegExp;
//   /** Additional conditions for matching */
//   match?: (token: string) => boolean;
//   /** Minimum token length */
//   minLength?: number;
//   /** Maximum token length */
//   maxLength?: number;
// };
