
export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'daily-blend',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/dotenv',
    '@nuxtjs/axios',
    '@nuxtjs/auth-next'
  ],
  env: {
    spotifyId: process.env.SPOTIFY_CLIENT_ID,
    spotifySecret: process.env.SPOTIFY_CLIENT_SECRET
  },

  auth: {
    strategies: {
      social: {
        scheme: 'oauth2',
        endpoints: {
          authorization: 'https://accounts.spotify.com/authorize',
          token: 'https://accounts.spotify.com/api/token',
          logout: 'http://localhost:3000/logout',
          userInfo: 'https://api.spotify.com/v1/me',
        },
        token: {
          property: 'access_token',
          type: 'Bearer',
          maxAge: 180000,
        },
        refreshToken: {
          property: 'refresh_token',
          maxAge: 60 * 60 * 24 * 30,
        },
        responseType: 'code',
        grantType: 'authorization_code',
        accessType: undefined,
        redirectUri: 'http://localhost:3000',
        logoutRedirectUri: '/',
        clientId: process.env.SPOTIFY_CLIENT_ID,
        // clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        scope: ['user-read-private', 'user-read-email'],
        state: '',
        codeChallengeMethod: 'S256',
        codeChallenge: '',
        codeVerifier: '',
        responseMode: '',
        acrValues: '',
        autoLogout: true
      },
    },
  },


  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  router: {
    middleware: ['auth']
  },

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}
