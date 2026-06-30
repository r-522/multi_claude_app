import type { PlatformProxy } from "wrangler";

import type { Env } from "~/shared/types/env";

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare;
  }
}

export type { Cloudflare };
