import { writable } from "svelte/store";

export type AudioData = {
  blob: Blob;
  audioURL: string;
  transcript?: string;
  image?: string;
};

export let audioUrls = writable<AudioData[]>([]);