import api from '../../service/woocommerce.js'
import * as actionTypes from '../actionTypes'
import * as mutationTypes from '../mutationTypes'

const emptySingle = {
  product: '',
  variations: ''
}

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
      method_id: 'flat_rate',
      method_title: 'Flat rate',
      total: '10'
    }
  ]
}

const state = {
  cart: [],
  products: [],
  categories: [],
  shipping_zones: [],
  shipping_locations: [],
  shipping_methods: [],
  singleProduct: emptySingle,
  order: emptyOrder,
  payment: {
    orderResponse: '',
    progress: ''
  }
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
  async [actionTypes.GET_SHIPPING_ZONES]({commit, state}) {
    commit(mutationTypes.SET_SHIPPING_ZONES, await api.getShippingZones())
  },
  async [actionTypes.GET_SHIPPING_ZONE_LOCATIONS]({commit, state}, id) {
    commit(mutationTypes.SET_SHIPPING_ZONE_LOCATIONS, await api.getShippingZoneLocations(id))
  },
  async [actionTypes.GET_SHIPPING_ZONE_METHODS]({commit, state}, id) {
    commit(mutationTypes.SET_SHIPPING_ZONE_METHODS, await api.getShippingZoneMethods(id))
  },
  // BUILDING THE ORDER
  [actionTypes.ADD_TO_CART]({commit, state}, data) {
    commit(mutationTypes.ADD_TO_CART, data)
  },
  [actionTypes.ADD_CUSTOMER_INFO]({commit, state}, data) {
    commit(mutationTypes.ADD_CUSTOMER_INFO, data)
  },
  // PROCESSING THE ORDER
  async [actionTypes.PLACE_ORDER]({commit, state}, order) {
    commit(mutationTypes.PLACE_ORDER, await api.placeOrder(order))
  },
  async [actionTypes.PAY_ORDER]({commit, state}, data) {
    commit(mutationTypes.PAY_ORDER, await api.payOrder(data))
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
  [mutationTypes.SET_SHIPPING_ZONES](state, data) {
    state.shipping_zones = data
  },
  [mutationTypes.SET_SHIPPING_ZONE_LOCATIONS](state, data) {
    state.shipping_locations.push(data)
  },
  [mutationTypes.SET_SHIPPING_ZONE_METHODS](state, data) {
    state.shipping_methods.push(data)
  },
  [mutationTypes.SET_PRODUCT_VARIATIONS](state, data) {
    state.singleProduct.variations = data
  },
  [mutationTypes.ADD_TO_CART](state, data) {
    console.log(data.product)
    state.cart.push(data)
    if (data.product.variations.length > 0) {
      console.log('variable product', data)
      state.order.line_items.push({ product_id: data.product.id, variation_id: data.variation.id, quantity: 1 })
    } else {
      console.log('simple product', data.product)
      state.order.line_items.push({ product_id: data.product.id, quantity: 1 })
    }
  },
  [mutationTypes.ADD_CUSTOMER_INFO](state, data) {
    let b = state.order.billing
    let s = state.order.shipping
    let same = data.sameAsBilling
    if (same) {
      b.address_1 = data.billing.address
      b.first_name = s.first_name = data.billing.firstName
      b.last_name = s.last_name = data.billing.lastName
      b.city = s.city = data.billing.city
      b.state = s.state = data.billing.state
      b.postcode = s.postcode = data.billing.postcode
      b.country = s.country = data.billing.country
      b.email = data.billing.email
      b.phone = data.billing.phone
    } else {
      b.address_1 = data.billing.address
      b.first_name = data.billing.firstName
      b.last_name = data.billing.lastName
      b.city = data.billing.city
      b.state = data.billing.state
      b.postcode = data.billing.postcode
      b.country = data.billing.country
      b.email = data.billing.email
      b.phone = data.billing.phone
      s.address_1 = data.shipping.address
      s.first_name = data.shipping.firstName
      s.last_name = data.shipping.lastName
      s.city = data.shipping.city
      s.state = data.shipping.state
      s.postcode = data.shipping.postcode
      s.country = data.shipping.country
    }
  },
  [mutationTypes.PLACE_ORDER](state, data) {
    console.log('data that returns from placing the order: ', data)
    state.payment.orderResponse = data
  },
  [mutationTypes.PAY_ORDER](state, data) {
    state.payment.progress = data
  }
}

const getters = {
  shippingZoneFromCountry: (state) => (countryCode) => {
    if (state.shipping_locations.length > 0) {
      state.shipping_locations.forEach(l => {
        l.forEach(a => {
          if (a.code === countryCode) console.log('found it, yu know it', a)
        })
      })
    }
  },
  productVariationByOption: (state) => (option) => {
    if (state.singleProduct.variations.length > 0) {
      return state.singleProduct.variations.find(v => v.attributes[0].option === option)
    } else return false
  },
  productById: (state) => (id) => {
    if (state.products.length > 0) {
      return state.products.find(p => p.id === id)
    } else return false
  },
  cartTotal: (state) => {
    let total = 0
    state.cart.map(i => {
      if (i.variation) {
        total += Number(i.variation.price)
      } else {
        total += Number(i.product.price)
      }
    })
    return total
  }
}

export default {
  state,
  actions,
  mutations,
  getters
}
