import { withAxiom } from 'next-axiom';
// import { createContentlayerPlugin } from 'next-contentlayer';

const nextConfig = async (phase, { defaultConfig }) => {
  /**
   * @type {import("next").NextConfig}
   */
  const config = {
    // Enable React strict mode.
    // https://nextjs.org/docs/api-reference/next.config.js/react-strict-mod
    reactStrictMode: true,

    // Configure domains to allow for optimized image loading.
    // https://nextjs.org/docs/basic-features/image-optimization#domains
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "cdn.discordapp.com"
        },
        {
          protocol: "https",
          hostname: "lh3.googleusercontent.com"
        },
        {
          protocol: "https",
          hostname: "avatars.githubusercontent.com"
        },
        {
          protocol: "https",
          hostname: "images.unsplash.com"
        }
      ]
    },

    // typescript: {
    //   ignoreBuildErrors: true,
    // },
    // eslint: {
    //   ignoreDuringBuilds: true,
    // },

    staticPageGenerationTimeout: 1200,

    // Enable experimental features.
    experimental: {
      esmExternals: false,
      // Specify external packages that should be excluded from server-side rendering.
      // https://beta.nextjs.org/docs/api-reference/next-config#servercomponentsexternalpackages
      serverComponentsExternalPackages: ["@prisma/client"]
    }

    // redirects() {
    //   return [
    //     {
    //       source: '/components',
    //       destination: '/docs/components/accordion',
    //       permanent: true,
    //     },
    //     {
    //       source: '/docs/components',
    //       destination: '/docs/components/accordion',
    //       permanent: true,
    //     },
    //     {
    //       source: '/examples',
    //       destination: '/examples/dashboard',
    //       permanent: false,
    //     },
    //     {
    //       source: '/docs/primitives/:path*',
    //       destination: '/docs/components/:path*',
    //       permanent: true,
    //     },
    //     {
    //       source: '/figma',
    //       destination: '/docs/figma',
    //       permanent: true,
    //     },
    //     {
    //       source: '/docs/forms',
    //       destination: '/docs/forms/react-hook-form',
    //       permanent: false,
    //     },
    //   ];
    // },
  };
  if (phase === "phase-development-server") {
    const fs = await import("node:fs");
    const glob = await import("glob").then((mod) => mod.default);

    const packageNames = new glob.GlobSync(
      "../../packages/**/package.json"
    ).found
      .map((file) => {
        try {
          const packageJson = JSON.parse(fs.readFileSync(file, "utf8"));
          return packageJson.name;
        } catch (error) {
          return null;
        }
      })
      .filter((pkg) => pkg?.startsWith("@udecode"));

    config.transpilePackages = packageNames;
  }

  return config;
};

export default withAxiom(nextConfig);
