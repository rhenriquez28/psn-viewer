import { withPlausibleProxy } from "next-plausible";

/**
 * Don't be scared of the generics here.
 * All they do is to give us autocompletion when using this.
 *
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function defineNextConfig(config) {
  return config;
}

export default withPlausibleProxy()({
  ...defineNextConfig({
    reactStrictMode: true,
    swcMinify: true,
    images: {
      domains: [
        "image.api.playstation.com",
        "static-resource.np.community.playstation.net",
        "psnobj.prod.dl.playstation.net",
        "psn-rsc.prod.dl.playstation.net",
      ],
    },
    experimental: {
      images: {
        unoptimized: true,
      },
    },
    async redirects() {
      return [
        {
          source: "/",
          destination: "/profile",
          permanent: true,
        },
      ];
    },
  }),
});
