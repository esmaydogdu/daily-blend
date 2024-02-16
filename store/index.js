export const state = () => ({
  user: null
})

export const mutations = {
  setUser(state, user) {
    state.user = user;
  },
};

export const actions = {
  async saveUser({ commit, rootState }) {

    try {
      const { data, error } = await this.$supabase.from('user').upsert({
        username: rootState.auth?.user?.id,
        avatarUrl: rootState.auth?.user?.images[1]?.url
      }, { onConflict: ['username'] })

      commit('setUser', data[0])
    } catch (e) {
      throw e
    }
  },
  recommendationTrackMapper(_, track) {
    console.log('received track:', track)
    return {
      id: track.trackId,
      trackUrl: track.trackUrl,
      userRates: JSON.parse(track.userRates || '{}'),
    }
  },
}