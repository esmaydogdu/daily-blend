<template>
  <div>
    <button @click="logout">Logout</button>
    <h1>welcome {{ userProfile.display_name }}</h1>
    <input v-model="searchQuery" @input="search" placeholder="Search for songs...">
    <ul>
      <li v-for="track in searchResults" :key="track.id" @click="addTrack(track)">{{ track.name }} by {{
        track.artists[0].name }}
      </li>
    </ul>
    <div v-for="item in selectedTracks" :key="item.id">
      {{ item.name }} by
      <span v-if="item.artists.length === 1">{{ item.artists[0].name }}</span>
      <template v-else-if="item.artists.length >= 1">
        <span v-for="artist in item.artists" :key="artist.id">{{ artist.name }}&nbsp;</span>
      </template>
      <button @click="removeTrack(item.id)">Remove</button>
    </div>
    <button @click="createBlend">Send it to blend</button>
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
      selectedTracks: []
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

        await $supabase.from('user').upsert({
          username: $auth?.user?.id,
          avatarUrl: $auth?.user?.images[1]?.url
        }, { onConflict: ['username'] })

        return { userProfile: apiResponse.data }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
  methods: {
    async createBlend() {
      // const id1 = this.selectedTracks[0].id
      // const id2 = this.selectedTracks[1].id
      // console.log('ids', id1, id2)
      // const response = await this.$axios.get(
      //   `https://api.spotify.com/v1/recommendations?seed_tracks=${id1},${id2}`,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${this.$auth.strategy.token}`,
      //     },
      //   }
      // );
      // console.log('recomm', response.data)

      try {
        // Fetch user id from db
        const username = this.$auth.user.id
        console.log('username', username)
        const { data } = await this.$supabase.from('user').select('id').eq('username', username)
        console.log('data', data)
        const userId = data[0].id

        // Create seed track body to post
        const trackIds = this.selectedTracks.map(track => track.id)
        const tracks = this.selectedTracks.map(track => {
          return {
            userId: userId,
            trackId: track.id
          }
        })

        console.log('tracks to post', tracks)

        const seeds = await this.$supabase.from("seedTrack").insert(tracks);
        console.log(seeds)

        // Check other seeds
        const otherSeeds = await this.$supabase
          .from('seedTrack')
          .select('userId, trackId')
          .neq('trackId', trackIds)
        // still need to check if there is another user here
        console.log('otherSeeds', otherSeeds)






        // make a call to supase to see 

      } catch (e) {
        console.log(e.message)
      }
    },
    async postBlend() {

      try {
        const username = this.$auth.user.id
        const { data } = await this.$supabase.from('user').select('id').eq('username', username)
        console.log('user from supabase', data[0])
        const userId = data[0].id
        const seedTrackBody = this.selectedTracks.map(tr => {
          return {
            userId,
            trackId: tr.id
          }
        })
        console.log('seedTrackBody', seedTrackBody)
        const { data2 } = await this.$supabase.from("seedTrack").insert(seedTrackBody);
      } catch (e) {
        console.log('problem:', e.message)
      }
      // const res = await this.$axios.get('/api/blend');
      // console.log(res);
    },
    async logout() {
      try {

        await this.$auth.logout();
        this.$router.push('/login');

      } catch (error) {

        console.error('Logout error:', error);

      }
    },
    addTrack(track) {
      this.selectedTracks.push(track)
    },
    removeTrack(id) {
      const trackIndex = this.selectedTracks.findIndex(track => track.id === id)
      if (trackIndex > -1) {
        this.selectedTracks.splice(trackIndex, 1)
      }
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
