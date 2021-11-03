/**
 * Text during normalization we can check whether the state has change based on the earlier formattingStates
 * If it did we know that we have to change the corresponding value of the node
 *
 * Level only triggers if that value is not set yet
 * and when it is changed we have to set every child on the level to that value
 *
 * Self is just flips / changes the current value
 */

export type FormattingSources<T> = {
  text?: unknown;
  dirty?: boolean;
};

export type PreviousStates = {
  bold: FormattingSources<boolean>;
  italic: FormattingSources<boolean>;
  underline: FormattingSources<boolean>;
  crossed: FormattingSources<boolean>;
  fontSize: FormattingSources<string>;
  fontFamily: FormattingSources<string>;
};

export type LicNodeAdditionalProps = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  crossed: boolean;
  fontSize: string;
  fontFamily: string;
  prev: PreviousStates;
};
