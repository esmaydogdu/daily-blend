<!-- pages/callback.vue -->

<template>
  <div>
    Logging in...
    <button @click="login">Login with Spotify</button>
    <button @click="logout">Logout</button>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  // async asyncData({ app }) {
  //   await app.$auth.loginWith('spotify');
  // },
  methods: {
    async login() {
      // this.$auth.loginWith('social')

      // const clientId = process.env.SPOTIFY_CLIENT_ID;
      // const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
      // console.log('>>> cs:', clientId, clientSecret)
      // const base64Credentials = btoa(`${clientId}:${clientSecret}`);
      // const headers = {
      //   'Content-Type': 'application/x-www-form-urlencoded',
      //   'Authorization': `Basic ${base64Credentials}`,
      // };
      try {
        await this.$auth.loginWith('social');
        await this.$router.replace('/spotify');
      } catch (error) {
        console.error('Login error:', error);
      }
    },
    logout() {
      this.$auth.logout();
    },
  }
};
</script>
