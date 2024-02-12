<!-- pages/callback.vue -->

<template>
  <div>
    <button @click="login">Login with Spotify</button>
    <button v-if="isUserLoggedIn" @click="logout">Logout</button>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  methods: {
    async login() {
      try {
        await this.$auth.loginWith('social')
        await console.log('something else')
      } catch (error) {
        console.error('Login error:', error);
      }
    },
    logout() {
      this.$auth.logout();
    },
  },
  async asyncData({ params, $auth }) {
    if ($auth.loggedIn) {
      // Access the user information after a successful login
      const user = $auth.user;

      // Call the method to upsert user data to Supabase

      // const userSaved = await $supabase.from('user').insert({
      //   username: $auth?.user?.id,
      //   avatarUrl: $auth?.user?.images[1]?.url
      // })

      // console.log('>> user:', userSaved)

      // Any other code you want to run after a successful login
      console.log('Login successful!');
    }
  },
  computed: {
    isUserLoggedIn() {
      return this.$auth.loggedIn;
    }
  }
};
</script>
