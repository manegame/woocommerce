import api from '../../service/woocommerce.js'
import * as actionTypes from '../actionTypes'
import * as mutationTypes from '../mutationTypes'

const state = {
  products: [],
  categories: [],
  singleProduct: ''
}

const actions = {
  async [actionTypes.GET_PRODUCTS]({commit, state}) {
    commit(mutationTypes.SET_PRODUCTS, await api.getProducts())
  },
  async [actionTypes.GET_PRODUCT_CATEGORIES]({commit, state}) {
    commit(mutationTypes.SET_PRODUCT_CATEGORIES, await api.getProductCategories())
  },
  async [actionTypes.GET_PRODUCT]({commit, state}, slug) {
    commit(mutationTypes.SET_PRODUCT, await api.getProduct(slug))
  }
}

const mutations = {
  [mutationTypes.SET_PRODUCTS](state, data) {
    state.products = data
  },
  [mutationTypes.SET_PRODUCT_CATEGORIES](state, data) {
    state.categories = data
  },
  [mutationTypes.SET_PRODUCT](state, data) {
    state.singleProduct = data
  }
}

export default {
  state,
  actions,
  mutations
}
