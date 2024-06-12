<script lang="ts">
  import type { AudioData } from "$lib/audioList";

  export let audio: AudioData;

  let audioElem: HTMLAudioElement;
  let isPlaying = false;
</script>

<div class="bg-gray-100 rounded-xl overflow-hidden" data-id="25">
  {#if audio.image}
    <img
      data-id="26"
      src={audio.image}
      width="320"
      height="240"
      alt=""
      class="w-full h-auto"
      style="aspect-ratio: 320 / 240; object-fit: cover;"
    />
  {:else}
    <img
      data-id="26"
      src="/placeholder.svg"
      width="320"
      height="240"
      alt=""
      class="w-full h-auto"
      style="aspect-ratio: 320 / 240; object-fit: cover;"
    />
  {/if}
  <div class="p-4" data-id="27">
    <p class="text-gray-600 mb-2" data-id="28">
      Transcript:
      {#if audio.transcript}
        {audio.transcript}
      {:else}
        ...
      {/if}
    </p>
    <audio controls src={audio.audioURL} class="hidden" bind:this={audioElem}
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
      class="whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gray-200 text-gray-600 font-medium hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8B5CF6]"
      data-id="29"
      ><svg
        data-id="30"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="w-4 h-4"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg
      >Play Audio</button
    >
  </div>
</div>
