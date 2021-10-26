import {
  AnyObject,
  getPlatePluginOptions,
  OverrideProps,
  SPRenderLeafProps,
  SPRenderNodeProps,
} from '@udecode/plate-core';
import clsx, { ClassDictionary } from 'clsx';
import {
  MARK_BG_COLOR,
  MARK_COLOR,
  MARK_FONT_FAMILY,
  MARK_FONT_SIZE,
  MARK_FONT_WEIGHT,
} from './defaults';
import {
  FontColorPluginOptions,
  FontFamilyPluginOptions,
  FontSizePluginOptions,
  FontWeightPluginOptions,
} from './types';

type HandleOverridePropsParams = {
  type: string;
  options?: unknown[];
  defaultOption?: unknown;
  classNames?: Partial<Record<string | number | symbol, unknown>>;
};

const handleOverrideProps = ({
  type,
  options,
  defaultOption,
  classNames,
}: HandleOverridePropsParams) => {
  return (props: SPRenderLeafProps | SPRenderNodeProps) => {
    if (!props.text) return;

    const value = props.text[type] as string | number;

    if (
      !value ||
      (defaultOption !== undefined && value === defaultOption) ||
      (options && !options.includes(value))
    ) {
      return;
    }

    const res: AnyObject = {};

    if (classNames?.[value]) {
      res.className = clsx(
        props.className,
        classNames[value] as ClassDictionary
      );
    } else {
      res.style = {
        ...props.style,
        [type]: value,
      };
    }

    return res;
  };
};

export const getFontColorOverrideProps = (): OverrideProps => (editor) => {
  const { colors, defaultColor, classNames } = getPlatePluginOptions<
    Required<FontColorPluginOptions>
  >(editor, MARK_COLOR);

  return handleOverrideProps({
    type: MARK_COLOR,
    defaultOption: defaultColor,
    options: colors,
    classNames,
  });
};

export const getFontBackgroundColorOverrideProps = (): OverrideProps => (
  editor
) => {
  const { colors, defaultColor, classNames } = getPlatePluginOptions<
    Required<FontColorPluginOptions>
  >(editor, MARK_BG_COLOR);

  return handleOverrideProps({
    type: MARK_BG_COLOR,
    defaultOption: defaultColor,
    options: colors,
    classNames,
  });
};

export const getFontFamilyOverrideProps = (): OverrideProps => (editor) => {
  const { fontFamilies, defaultFontFamily, classNames } = getPlatePluginOptions<
    Required<FontFamilyPluginOptions>
  >(editor, MARK_FONT_FAMILY);

  return handleOverrideProps({
    type: MARK_FONT_FAMILY,
    defaultOption: defaultFontFamily,
    options: fontFamilies,
    classNames,
  });
};

export const getFontSizeOverrideProps = (): OverrideProps => (editor) => {
  const { fontSizes, defaultFontSize, classNames } = getPlatePluginOptions<
    Required<FontSizePluginOptions>
  >(editor, MARK_FONT_SIZE);

  return handleOverrideProps({
    type: MARK_FONT_SIZE,
    defaultOption: defaultFontSize,
    options: fontSizes,
    classNames,
  });
};

export const getFontWeightOverrideProps = (): OverrideProps => (editor) => {
  const { fontWeights, defaultFontWeight, classNames } = getPlatePluginOptions<
    Required<FontWeightPluginOptions>
  >(editor, MARK_FONT_WEIGHT);

  return handleOverrideProps({
    type: MARK_FONT_WEIGHT,
    defaultOption: defaultFontWeight,
    options: fontWeights,
    classNames,
  });
};
