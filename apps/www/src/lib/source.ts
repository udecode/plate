import { docs } from '@/.source';
import { loader } from 'fumadocs-core/source';

export const source = loader({
  baseUrl: '/docs',
  i18n: {
    defaultLanguage: 'en',
    hideLocale: 'default-locale',
    languages: ['en', 'cn'],
  },
  source: docs.toFumadocsSource(),
});
