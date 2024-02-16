<!-- Please remove this file from your project -->
<template>
  <div>
    <div v-if="isLoading">
      Blend loading...
    </div>
    <div v-else>
      recomm component {{ track.userRates }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'Recommendation',
  props: {
    track: null,
    isLoading: false
  },
  computed: {
    // computedTrack() {
    //   return {
    //     id: this.track.trackId,
    //     url: this.track.trackUrl,
    //     userRates: JSON.parse(this.track.userRates)
    //   }
    // }
  }
}
</script>
