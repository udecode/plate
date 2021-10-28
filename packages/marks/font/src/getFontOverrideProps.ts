import { getLeafOverrideProps } from '@udecode/plate-common';
import { getPlatePluginOptions, OverrideProps } from '@udecode/plate-core';
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

export const getFontColorOverrideProps = (): OverrideProps => (editor) => {
  const { colors, defaultColor, classNames } = getPlatePluginOptions<
    Required<FontColorPluginOptions>
  >(editor, MARK_COLOR);

  return getLeafOverrideProps(editor, {
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

  return getLeafOverrideProps(editor, {
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

  return getLeafOverrideProps(editor, {
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

  return getLeafOverrideProps(editor, {
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

  return getLeafOverrideProps(editor, {
    type: MARK_FONT_WEIGHT,
    defaultOption: defaultFontWeight,
    options: fontWeights,
    classNames,
  });
};
