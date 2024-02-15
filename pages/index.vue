<template>
  <div>
    <div v-if="loading">loading...</div>
    <div v-else>
      <button @click="logout">Logout</button>
      <h1>welcome {{ userProfile.display_name }}</h1>
      <input v-model="searchQuery" @input="search" placeholder="Search for songs...">
      <ul>
        <li v-for="track in searchResults" :key="track.id" @click="addTrack(track)">{{ track.name }} by {{
          track.artists[0].name }}
        </li>
      </ul>
      <div v-if="!!selectedTrack">
        {{ selectedTrack.name }} by
        <span v-if="selectedTrack.artists.length === 1">{{ selectedTrack.artists[0].name }}</span>
        <template v-else-if="selectedTrack.artists.length >= 1">
          <span v-for="artist in selectedTrack.artists" :key="artist.id">{{ artist.name }}&nbsp;</span>
        </template>
        <button @click="removeTrack">Remove</button>
      </div>
      <button @click="createBlend" :disabled="!selectedTrack">Send it to blend</button>
    </div>
    <!-- <div v-for="item in selectedTracks" :key="item.id">
        {{ item.name }} by
        <span v-if="item.artists.length === 1">{{ item.artists[0].name }}</span>
        <template v-else-if="item.artists.length >= 1">
          <span v-for="artist in item.artists" :key="artist.id">{{ artist.name }}&nbsp;</span>
        </template>
        <button @click="removeTrack(item.id)">Remove</button>
      </div>
      <button @click="createBlend" :disabled="!selectedTracks.length">Send it to blend</button>
    </div> -->
  </div>
</template>

<script>
import { debounce } from 'lodash';
export default {
  name: 'IndexPage',
  data() {
    return {
      searchQuery: '',
      searchResults: [],
      selectedTracks: [],
      selectedTrack: null,
      loading: false
    };
  },
  async asyncData({ $auth, $axios, $supabase }) {
    try {
      if ($auth.loggedIn && $auth.strategy.token) {
        const apiResponse = await $axios.get('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${$auth.strategy.token}`,
          },
        });

        const { data } = await $supabase.from('user').upsert({
          username: $auth?.user?.id,
          avatarUrl: $auth?.user?.images[1]?.url
        }, { onConflict: ['username'] })
        // console.log('data in async data', data)
        // console.log('data in async data', data[0].id)
        return { userProfile: { ...apiResponse.data, username: apiResponse.data.id, id: data[0].id } }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
  methods: {
    async createBlend() {
      try {
        // Create seed track body to post
        this.loading = true;
        const trackIds = this.selectedTracks.map(track => track.id)
        const tracks = this.selectedTracks.map(track => {
          return {
            userId: this.userProfile.id,
            trackId: track.id,
            submittedAt: Date.now()
          }
        })

        const submittedSeeds = await this.$supabase.from("seedTrack").insert(tracks);
        // this is returning the freshly inserted ones
        console.log(submittedSeeds)

        // Check other seeds
        const seedsFromOtherUsers = await this.$supabase
          .from('seedTrack')
          .select('userId, trackId')
          .neq('trackId', trackIds)
          .neq('userId', this.userProfile.id)
        // still need to check if there is another user here
        console.log('otherSeeds', seedsFromOtherUsers)

        const runRecommendation = submittedSeeds.data.length && seedsFromOtherUsers.data.length

        if (runRecommendation) {
          console.log('we are going to generate recommendations with all the seeds')
          const allSeeds = await this.$supabase.from('seedTrack').select('trackId')
          const trackIds = allSeeds.data.map(tr => tr.trackId)
          // console.log('allSeeds:', allSeeds)
          const recommendation = await this.$axios.get('https://api.spotify.com/v1/recommendations', {
            headers: {
              Authorization: `Bearer ${this.$auth.strategy.token}`,
            },
            params: {
              limit: encodeURIComponent('1'),
              seed_tracks: trackIds.join(','),
              seed_artists: encodeURIComponent(''),
              seed_genres: encodeURIComponent('')
            },
          });

          console.log('recommendation:', recommendation)
          this.resetSearch()
        }




        // make a call to supase to see 

      } catch (e) {
        console.log(e.message)
      }
      this.loading = false
    },
    async logout() {
      try {

        await this.$auth.logout();
        this.$router.push('/login');

      } catch (error) {

        console.error('Logout error:', error);

      }
    },
    resetSearch() {
      this.searchQuery = ''
      this.selectedTracks = []
      this.searchResults = []
    },
    addTrack(track) {
      this.selectedTrack = track
      this.selectedTracks.push(track)
    },
    removeTrack() {
      // const trackIndex = this.selectedTracks.findIndex(track => track.id === id)
      // if (trackIndex > -1) {
      //   this.selectedTracks.splice(trackIndex, 1)
      // }
      this.selectedTracks = [];
      this.selectedTrack = null
    },
    search: debounce(function () {
      try {
        if (this.searchQuery.trim() === '') {
          this.searchResults = [];
          return;
        }

        this.$axios
          .get('https://api.spotify.com/v1/search', {
            params: {
              q: this.searchQuery,
              type: 'track',
            },
            headers: {
              Authorization: `Bearer ${this.$auth.strategy.token}`,
            },
          })
          .then((response) => {
            this.searchResults = response.data.tracks.items;
          })
          .catch((error) => {
            console.error('Error searching songs:', error);
          });
      } catch (error) {
        console.error('Error searching songs:', error);
      }
    }, 300),
  }
}
</script>
