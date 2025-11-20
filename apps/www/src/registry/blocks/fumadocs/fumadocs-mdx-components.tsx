import type { MDXComponents } from 'mdx/types';

import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { MinusIcon, SquareAsteriskIcon } from 'lucide-react';

import {
  API,
  APIAttributes,
  APIItem,
  APIList,
  APIListAPI,
  APIMethods,
  APIOptions,
  APIParameters,
  APIProps,
  APIReturns,
  APIState,
  APISubList,
  APISubListItem,
  APITransforms,
  EmptyComponent,
  KeyTable,
  KeyTableItem,
  Steps,
} from './mdx-plate-components';

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...components,
    ...plateMdxComponents,
  };
}

const plateMdxComponents = {
  Accordion,
  Accordions,
  API,
  APIAttributes,
  APIItem,
  APIList,
  APIListAPI,
  APIMethods,
  APIOptions,
  APIParameters,
  APIProps,
  APIReturns,
  APIState,
  APISubList,
  APISubListItem,
  APITransforms,
  ComponentExample: EmptyComponent,
  ComponentInstallation: EmptyComponent,
  ComponentPreview: EmptyComponent,
  ComponentPreviewPro: EmptyComponent,
  ComponentSource: EmptyComponent,
  KeyTable,
  KeyTableItem,
  MinusIcon,
  PackageInfo: EmptyComponent,
  SquareAsteriskIcon,
  Steps,
};
