<script lang="ts">
  import { onMount } from "svelte";
  import { FFmpeg } from "@ffmpeg/ffmpeg";
  import { blobToBase64, convertWebmToMp3 } from "$lib/ffmpeg/mp3Converter";
  import { page } from "$app/stores";
  import { trpc } from "$lib/trpc/client";

  import { send, receive } from "$lib/transition";
  import { audioUrls, type AudioData } from "$lib/audioList";
  let transcript: Promise<string> | undefined;
  let audio: string;
  let image: Promise<string> | undefined;

  async function laodUserMedia() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw "User media not supported on your device";
    }

    let mediaStream = await navigator.mediaDevices.getUserMedia(
      // constraints - only audio needed for this app
      {
        audio: true,
      }
    );

    let mediaRecorder = new MediaRecorder(mediaStream);

    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    mediaRecorder.onstop = async (e) => {
      console.log("recorder stopped");

      const data = new Blob(chunks, { type: "audio/webm; codecs=opus" });
      chunks = [];

      let blob = await convertWebmToMp3(ffmpeg, data);

      const audioURL = window.URL.createObjectURL(blob);
      audio = audioURL;

      const audioInfo: AudioData = {
        blob,
        audioURL,
      };
      audioUrls.update((urls) => [audioInfo, ...urls]);
      transcript = trancribe(blob);
      audioInfo.transcript = await transcript;

      audioUrls.update((urls) => urls);
      const emojiInput = await emojiPrompt(audioInfo.transcript);

      image = emojiImage(emojiInput);
      audioInfo.image = await image;
      audioUrls.update((urls) => urls);
    };
    return mediaRecorder;
  }
  let mediaRecorder: MediaRecorder | undefined;

  let chunks: Blob[] = [];

  let ffmpeg: FFmpeg;

  const emojiPrompt = async (text: string) => {
    return await trpc($page).generateEmojiPrompt.mutate({ text });
  };

  const emojiImage = async (prompt: string) => {
    return await trpc($page).generateEmoji.mutate({ prompt });
  };

  const trancribe = async (blob: Blob) => {
    const base64Data = await blobToBase64(blob);
    const audio = `data:application/octet-stream;base64,${base64Data}`;
    const test = await trpc($page).transcribe.mutate({ audio });
    return test.text;
  };

  async function loadFFmpeg() {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

    ffmpeg = new FFmpeg();
    await ffmpeg.load({
      coreURL: `${baseURL}/ffmpeg-core.js`,
      wasmURL: `${baseURL}/ffmpeg-core.wasm`,
    });
  }

  onMount(() => {
    loadFFmpeg();
  });

  let audioElem: HTMLAudioElement;
  let isPlaying = false;
</script>

<div class="max-w-2xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">
  <div
    id="dyp7bitdwr4"
    class="flex flex-col items-center justify-center p-8 sm:p-12"
  >
    <h1 class="text-3xl font-bold text-gray-900 mb-4">AE: Audio to Emoji</h1>
    <p class="text-gray-600 mb-8">
      Record an audio clip and let our AI model generate a custom emoji
      answering you.
    </p>
    <div class="relative w-full max-w-md mb-10">
      <button
        class="flex items-center justify-center w-full"
        on:click={async () => {
          if (!mediaRecorder) {
            mediaRecorder = await laodUserMedia();
            audio = "";
            image = undefined;
            transcript = undefined;
            mediaRecorder.start();
          } else {
            mediaRecorder.stop();
            for (let tracks of mediaRecorder.stream.getAudioTracks()) {
              tracks.stop();
            }
            mediaRecorder = undefined;
          }
        }}
      >
        {#if !mediaRecorder}
          <div
            in:receive={{ key: "button" }}
            out:send={{ key: "button" }}
            class="absolute whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 bg-primary hover:bg-primary/90 w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white font-medium hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8B5CF6]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-6 h-6"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"
              ></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" x2="12" y1="19" y2="22"></line>
            </svg>
            Record Audio
          </div>
        {:else}
          <div
            class="absolute w-full h-full flex items-center justify-center"
            data-id="9"
          >
            <div
              in:receive={{ key: "button" }}
              out:send={{ key: "button" }}
              class="bg-primary w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]"
            >
              <svg
                data-id="11"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="w-10 h-10 text-white animate-pulse"
                ><path
                  d="M2 13a2 2 0 0 0 2-2V7a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0V4a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0v-4a2 2 0 0 1 2-2"
                ></path></svg
              >
            </div>
          </div>
        {/if}
      </button>
    </div>
    {#if image}
      {#await image}
        <div class="w-full max-w-md bg-gray-100 rounded-xl overflow-hidden">
          <div class="flex items-center justify-center h-[480px]">
            <div
              class="w-16 h-16 bg-white rounded-full flex items-center justify-center animate-spin"
            >
              <svg
                class="w-10 h-10 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M2 12c0-2.8 2.2-5 5-5s5 2.2 5 5 2.2 5 5 5 5-2.2 5-5" />
                <path d="M7 20.7a1 1 0 1 1 5-8.7 1 1 0 1 0 5-8.6" />
                <path d="M7 3.3a1 1 0 1 1 5 8.6 1 1 0 1 0 5 8.6" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
          </div>
        </div>
      {:then image}
        <div class="w-full max-w-md bg-gray-100 rounded-xl overflow-hidden">
          <img
            src={image}
            width="640"
            height="480"
            alt=""
            class="w-full h-auto"
            style="aspect-ratio: 640 / 480; object-fit: cover;"
          />
        </div>
      {:catch error}
        <div class="w-full max-w-md bg-gray-100 rounded-xl overflow-hidden">
          Could not generate image: {error}
        </div>
      {/await}
    {/if}

    {#if transcript || audio}
      <div class="mt-8 w-full max-w-md bg-gray-100 rounded-xl overflow-hidden">
        <div class="p-4">
          {#if transcript}
            {#await transcript}
              <p class="text-gray-600 mb-2">Transcript: Loading...</p>
            {:then text}
              <p class="text-gray-600 mb-2">Transcript: {text}</p>
            {:catch error}
              <p class="text-gray-600 mb-2">Error: {error}</p>
            {/await}
          {/if}
          {#if audio}
            <audio controls src={audio} class="hidden" bind:this={audioElem}
            ></audio>
            <button
              on:click={() => {
                if (isPlaying) {
                  audioElem.pause();
                } else {
                  audioElem.play();
                }
                isPlaying = !isPlaying;
              }}
              class="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gray-200 text-gray-600 font-medium hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8B5CF6]"
            >
              <svg
                class="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
              Play Audio
            </button>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>
