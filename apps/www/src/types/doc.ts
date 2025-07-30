export interface Doc {
  slug: string;
  body?: {
    raw: string;
  };
  description?: string;
  docs?: {
    route: string;
    title: string;
  }[];
  links?: {
    api?: string;
    doc?: string;
  };
  title?: string;
  url?: string;
}