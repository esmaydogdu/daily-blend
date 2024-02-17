<!-- Please remove this file from your project -->
<template>
  <div>
    <div v-if="isLoading">
      Blend loading...
    </div>
    <div v-else>
      <span :style="{ 'color': '#' + color }">$$$$$</span> {{ track.userRates }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'Recommendation',
  props: {
    track: null,
    isLoading: false,
    color: { type: String, required: true }
  }
}
</script>
