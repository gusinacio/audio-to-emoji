// lib/trpc/context.ts
import type { RequestEvent } from "@sveltejs/kit";
import type { inferAsyncReturnType } from "@trpc/server";
import Replicate from "replicate";

// we're not using the event parameter is this example,
// hence the eslint-disable rule
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function createContext(event: RequestEvent) {
  const replicate = new Replicate();
  return {
    replicate,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
