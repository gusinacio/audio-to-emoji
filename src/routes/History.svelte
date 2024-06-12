<script>
  import { audioUrls } from "$lib/audioList";
  import HistoryItem from "./HistoryItem.svelte";
</script>

{#if $audioUrls.length > 0}
  <div
    class="mt-8 w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden"
    data-id="21"
  >
    <div class="p-8 sm:p-12" data-id="22">
      <h2 class="text-2xl font-bold text-gray-900 mb-4" data-id="23">
        History
      </h2>
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        data-id="24"
      >
        {#each $audioUrls as audio}
          <HistoryItem {audio} />
        {/each}
      </div>
    </div>
  </div>
{/if}
