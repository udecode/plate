export declare const FRAMEWORKS: {
    readonly "next-app": {
        readonly name: "next-app";
        readonly label: "Next.js";
        readonly links: {
            readonly installation: "https://ui.shadcn.com/docs/installation/next";
            readonly tailwind: "https://tailwindcss.com/docs/guides/nextjs";
        };
    };
    readonly "next-pages": {
        readonly name: "next-pages";
        readonly label: "Next.js";
        readonly links: {
            readonly installation: "https://ui.shadcn.com/docs/installation/next";
            readonly tailwind: "https://tailwindcss.com/docs/guides/nextjs";
        };
    };
    readonly remix: {
        readonly name: "remix";
        readonly label: "Remix";
        readonly links: {
            readonly installation: "https://ui.shadcn.com/docs/installation/remix";
            readonly tailwind: "https://tailwindcss.com/docs/guides/remix";
        };
    };
    readonly vite: {
        readonly name: "vite";
        readonly label: "Vite";
        readonly links: {
            readonly installation: "https://ui.shadcn.com/docs/installation/vite";
            readonly tailwind: "https://tailwindcss.com/docs/guides/vite";
        };
    };
    readonly astro: {
        readonly name: "astro";
        readonly label: "Astro";
        readonly links: {
            readonly installation: "https://ui.shadcn.com/docs/installation/astro";
            readonly tailwind: "https://tailwindcss.com/docs/guides/astro";
        };
    };
    readonly laravel: {
        readonly name: "laravel";
        readonly label: "Laravel";
        readonly links: {
            readonly installation: "https://ui.shadcn.com/docs/installation/laravel";
            readonly tailwind: "https://tailwindcss.com/docs/guides/laravel";
        };
    };
    readonly gatsby: {
        readonly name: "gatsby";
        readonly label: "Gatsby";
        readonly links: {
            readonly installation: "https://ui.shadcn.com/docs/installation/gatsby";
            readonly tailwind: "https://tailwindcss.com/docs/guides/gatsby";
        };
    };
    readonly manual: {
        readonly name: "manual";
        readonly label: "Manual";
        readonly links: {
            readonly installation: "https://ui.shadcn.com/docs/installation/manual";
            readonly tailwind: "https://tailwindcss.com/docs/installation";
        };
    };
};
export type Framework = (typeof FRAMEWORKS)[keyof typeof FRAMEWORKS];
//# sourceMappingURL=frameworks.d.ts.map