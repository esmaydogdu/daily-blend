import firebase from 'firebase/app';
import 'firebase/firestore';

let crypto = require('node:crypto');

const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

const generatedCodeVerifier = generateRandomString(64);

const sha256 = async (plain) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return crypto.subtle.digest('SHA-256', data)
}

const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const generatedHashed = async () => {
  return await sha256(generatedCodeVerifier)
}
const hashed = generatedHashed()
const generatedCodeChallenge = base64encode(hashed);

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
    '@nuxtjs/axios',
    '@nuxtjs/auth-next',
    '@nuxtjs/firebase'
  ],

  firebase: {
    config: {
      apiKey: "process.env.FIREBASE_API_KEY",
      authDomain: "process.env.FIREBASE_AUTH_DOMAIN",
      projectId: "process.env.FIREBASE_PROJECT_ID",
      storageBucket: "process.env.FIREBASE_STORAGE_BUCKET",
      messagingSenderId: "process.env.FIREBASE_MESSAGING_SENDER_ID",
      appId: "process.env.FIREBASE_APP_ID",
      measurementId: "process.env.FIREBASE_MEASUREMENT_ID",
    },
    services: {
      firestore: true
    },
  },


  firestore: {
    memoryOnly: false, // default
    chunkName: process.env.NODE_ENV !== 'production' ? 'firebase-auth' : '[id]', // default
    enablePersistence: true,
    emulatorPort: 8080,
    emulatorHost: 'localhost',
  },

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
          maxAge: 1800,
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
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        scope: ['user-read-private', 'user-read-email'],
        state: '',
        codeChallengeMethod: 'S256',
        codeChallenge: generatedCodeChallenge,
        codeVerifier: generatedCodeVerifier,
        responseMode: '',
        acrValues: '',
        autoLogout: false
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
  },

  serverMiddleware: [
    { path: "/api/blend", handler: "~/api/blend.js" },
  ]
}
