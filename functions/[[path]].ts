import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";

// @ts-expect-error - Virtual module provided by Remix build process
import * as build from "../build/server";

export const onRequest = createPagesFunctionHandler({
  build,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getLoadContext: (context) => ({
    cloudflare: {
      env: context.env,
      ctx: context,
      caches,
      cf: context.request.cf,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  }),
});
