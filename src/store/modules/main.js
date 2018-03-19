import api from '../../service/woocommerce.js'
import * as actionTypes from '../actionTypes'
import * as mutationTypes from '../mutationTypes'

const emptySingle = {
  product: '',
  variations: ''
}

// {
//   product_id: '',
//   variation_id: '',
//   quantity: ''
// }

const emptyOrder = {
  payment_method: '',
  payment_method_title: '',
  set_paid: false,
  billing: {
    first_name: '',
    last_name: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postcode: '',
    country: '',
    email: '',
    phone: ''
  },
  shipping: {
    first_name: '',
    last_name: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postcode: '',
    country: ''
  },
  line_items: [],
  shipping_lines: [
    {
      method_id: '',
      method_title: '',
      total: ''
    }
  ]
}

const state = {
  products: [],
  categories: [],
  singleProduct: emptySingle,
  order: emptyOrder
}

const actions = {
  // GET TYPES
  async [actionTypes.GET_PRODUCTS]({commit, state}) {
    commit(mutationTypes.SET_PRODUCTS, await api.getProducts())
  },
  async [actionTypes.GET_PRODUCT_CATEGORIES]({commit, state}) {
    commit(mutationTypes.SET_PRODUCT_CATEGORIES, await api.getProductCategories())
  },
  async [actionTypes.GET_PRODUCT]({commit, state}, slug) {
    commit(mutationTypes.SET_PRODUCT, await api.getProduct(slug))
  },
  async [actionTypes.GET_PRODUCT_VARIATIONS]({commit, state}, id) {
    commit(mutationTypes.SET_PRODUCT_VARIATIONS, await api.getProductVariations(id))
  },
  // CHANGE ORDER
  [actionTypes.ADD_PRODUCT]({commit, state}, data) {
    commit(mutationTypes.ADD_PRODUCT, data)
  },
  // POST TYPES
  async [actionTypes.POST_ORDER]({commit, state}, data) {
    commit(mutationTypes.SET_ORDER, await api.placeOrder(data))
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
    state.singleProduct.product = data
  },
  [mutationTypes.SET_PRODUCT_VARIATIONS](state, data) {
    state.singleProduct.variations = data
  },
  [mutationTypes.SET_ORDER](state, data) {
    state.order = data
  },
  [mutationTypes.ADD_PRODUCT](state, data) {
    console.log('add a product, ', data)
    state.order.line_items.push(data)
  }
}

const getters = {
  productVariationByOption: (state) => (option) => {
    if (state.singleProduct.variations.length > 0) {
      return state.singleProduct.variations.find(v => v.attributes[0].option === option)
    } else return false
  }
}

export default {
  state,
  actions,
  mutations,
  getters
}
