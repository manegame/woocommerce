import Vue from 'vue'
import Vuex from 'vuex'
import shop from './modules/shop'

Vue.use(Vuex)

const DEBUG = process.env.NODE_ENV === 'development'

export default new Vuex.Store({
  modules: {
    shop
  },
  strict: DEBUG
})
