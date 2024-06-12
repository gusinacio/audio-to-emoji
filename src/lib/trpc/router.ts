// lib/trpc/router.ts
import type { Context } from "./context";
import { initTRPC } from "@trpc/server";
import { z } from "zod";

export const t = initTRPC.context<Context>().create();

type SpeechOutput = {
  text: string;
  chunks: { text: string; timestamp: number[] }[];
};

const SPEECH_TO_TEXT_MODEL =
  "vaibhavs10/incredibly-fast-whisper:3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c";
const TEXT_TO_PROMPT_MODEL = "meta/meta-llama-3-8b-instruct";
const EMOJI_GENERATOR_MODEL =
  "fofr/sdxl-emoji:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e";

const TEXT_TO_EMOJI_PROMPT =
  'You are a helpful assistant that takes user message \
          and outputs a prompt to an image generator that will \
          generate emojis. \
          Don\'t respond with any other message just straight \
          respond with the prompt that generates an \
          emoji. \
          IMPORTANT: respond with a good description with more than 5 words. \
          \nIMPORTANT: Add the word "emoji" in the prompt.';

export const router = t.router({
  transcribe: t.procedure
    .input(z.object({ audio: z.string() }))
    .mutation(async ({ input: { audio }, ctx: { replicate } }) => {
      const input = {
        audio,
        batch_size: 64,
      };

      const output = (await replicate.run(SPEECH_TO_TEXT_MODEL, {
        input,
      })) as SpeechOutput;

      return output;
    }),
  generateEmojiPrompt: t.procedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ input: { text }, ctx: { replicate } }) => {
      const input = {
        top_k: 0,
        top_p: 0.95,
        prompt: text,
        max_tokens: 512,
        temperature: 0.7,
        system_prompt: TEXT_TO_EMOJI_PROMPT,
        length_penalty: 1,
        max_new_tokens: 512,
        stop_sequences: "<|end_of_text|>,<|eot_id|>",
        prompt_template:
          "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n",
        presence_penalty: 0,
        log_performance_metrics: false,
      };
      let output = "";
      for await (const event of replicate.stream(TEXT_TO_PROMPT_MODEL, {
        input,
      })) {
        output += event.toString();
      }

      return output;
    }),
  generateEmoji: t.procedure
    .input(z.object({ prompt: z.string() }))
    .mutation(async ({ input: { prompt }, ctx: { replicate } }) => {
      const input = {
        prompt,
        apply_watermark: false,
      };

      const output = (await replicate.run(EMOJI_GENERATOR_MODEL, {
        input,
      })) as string[];
      return output[0];
    }),
});

export type Router = typeof router;
