export const getI18nContent = <T>(i18n: T) => {
  return i18n[(process.env.NEXT_PUBLIC_LANGUAGE as keyof typeof i18n) ?? 'en'];
};
