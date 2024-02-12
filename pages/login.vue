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
      } catch (error) {
        console.error('Login error:', error);
      }
    },
    logout() {
      this.$auth.logout();
    },
  },
  computed: {
    isUserLoggedIn() {
      return this.$auth.loggedIn;
    }
  }
};
</script>
