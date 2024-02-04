<template>
  <div>
    <h1>welcome {{ userProfile.display_name }}</h1>
    <input v-model="searchQuery" @input="search" placeholder="Search for songs...">
    <ul>
      <li v-for="track in searchResults" :key="track.id">{{ track.name }} by {{ track.artists[0].name }}</li>
    </ul>
    <button @click="logout">Logout</button>
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
    };
  },
  async asyncData({ $auth, $axios }) {
    try {
      if ($auth.loggedIn && $auth.strategy.token) {
        const apiResponse = await $axios.get('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${$auth.strategy.token}`,
          },
        });

        return { userProfile: apiResponse.data };
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
  methods: {
    async logout() {
      try {

        await this.$auth.logout();
        this.$router.push('/login');

      } catch (error) {

        console.error('Logout error:', error);

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
