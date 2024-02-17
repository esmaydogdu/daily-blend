<template>
  <div>
    <div v-if="loading">loading...</div>
    <div v-else>
      <button @click="logout">Logout</button>
      <Recommendation :track="recommendedTrack" :isLoading="isRecommendationLoading" :color="hexColor" />
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
import Recommendation from '../components/Recommendation.vue';
import { strToRGB } from '../utils/generateColorCode'

export default {
  components: { Recommendation },
  name: 'IndexPage',
  data() {
    return {
      searchQuery: '',
      searchResults: [],
      selectedTracks: [],
      selectedTrack: null,
      recommendedTrack: null,
      loading: false,
      isRecommendationLoading: false,
      hexColor: '000'
    };
  },
  async asyncData({ $auth, $axios, $supabase, store }) {
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

        // fetch recommended
        let recommendedTrack = null
        const recommended = await $supabase.from('recommendationTrack')
          .select()
          .order('createdAt', { ascending: false })
          .range(0, 1)
        console.log('>>>>> recommended:', recommended)
        if (recommended?.data.length) {
          recommendedTrack = await store.dispatch('recommendationTrackMapper', recommended.data[0])
        }
        console.log('recommendedTrack in data', recommendedTrack)
        return {
          userProfile: { ...apiResponse.data, username: apiResponse.data.id, id: data[0].id },
          recommendedTrack
        }
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

        console.log('otherSeeds', seedsFromOtherUsers)

        const runRecommendation = submittedSeeds.data.length && seedsFromOtherUsers.data.length

        if (runRecommendation) {
          this.generateRecommendation();
          this.resetSearch()
        }

      } catch (e) {
        console.log(e.message)
      }
      this.loading = false
    },
    async generateRecommendation() {
      try {
        this.isRecommendationLoading = true
        const allSeeds = await this.$supabase.from('seedTrack')
          .select('trackId, userId')
          .order('submittedAt', { ascending: false })
          .range(0, 4)
        const trackIds = allSeeds.data.map(tr => tr.trackId)
        console.log('allSeeds:', allSeeds)
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
        const userRates = this.calculateUserRates(allSeeds.data)

        this.recommendedTrack = {}
        const { data } = await this.$supabase.from('recommendationTrack').insert({
          trackId: recommendation.data?.tracks[0]?.id,
          trackUrl: recommendation.data?.tracks[0]?.href,
          userRates: JSON.stringify(userRates),
          createdAt: Date.now()
        })

        this.recommendedTrack = await this.$store.dispatch('recommendationTrackMapper', data[0])
        this.isRecommendationLoading = false

        this.hexColor = strToRGB(recommendation.data?.tracks[0]?.id)

        console.log('hex Code for the recommendation:', this.hexColor)

        console.log('recomm table returning:', data)

        console.log('userRates:', userRates)

        console.log('recommendation:', recommendation)

      } catch (e) {
        console.log('recommendation generation error:', e)
      }

    },

    calculateUserRates(tracks) {
      const userRates = {}

      for (let i = 0; i < tracks.length; i++) {
        const currentUserId = tracks[i].userId
        if (!userRates[currentUserId]) {
          userRates[currentUserId] = 100 / tracks.length
        } else {
          userRates[currentUserId] = userRates[currentUserId] + (100 / tracks.length)
        }
      }

      return userRates
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
      this.selectedTrack = ''
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
