import api from '../../service/woocommerce.js'
import geo from '../../service/geo.js'
import {countries} from '@/assets/countries'
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
  shipping_lines: []
}

const state = {
  countryList: countries,
  cart: [],
  products: [],
  categories: [],
  shippingLoaded: false,
  shipping_zones: [],
  singleProduct: emptySingle,
  order: emptyOrder,
  payment: {
    orderResponse: '',
    progress: ''
  }
}

const actions = {
  // GET TYPES
  async [actionTypes.GET_GEO_LOCATION]({commit, state}) {
    commit(mutationTypes.SET_GEO_LOCATION, await geo.getPosition())
  },
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
  [actionTypes.SHIPPING_LOADED]({commit}) {
    commit(mutationTypes.SHIPPING_LOADED)
  },
  // BUILDING THE ORDER
  [actionTypes.ADD_TO_CART]({commit, state}, data) {
    commit(mutationTypes.ADD_TO_CART, data)
  },
  [actionTypes.REMOVE_FROM_CART]({commit, state}, data) {
    commit(mutationTypes.REMOVE_FROM_CART, data)
  },
  [actionTypes.ADD_CUSTOMER_INFO]({commit, state}, data) {
    commit(mutationTypes.ADD_CUSTOMER_INFO, data)
  },
  [actionTypes.SET_SHIPPING]({commit, state}, data) {
    commit(mutationTypes.SET_SHIPPING, data)
  },
  // PROCESSING THE ORDER
  async [actionTypes.PLACE_ORDER]({commit, state}, order) {
    commit(mutationTypes.PLACE_ORDER, await api.placeOrder(order))
  },
  async [actionTypes.PAY_ORDER]({commit, state}, data) {
    commit(mutationTypes.PAY_ORDER, await api.payOrder(data))
  },
  [actionTypes.EMPTY_ORDER]({commit}) {
    commit(mutationTypes.EMPTY_ORDER)
  }
}

const mutations = {
  [mutationTypes.SET_GEO_LOCATION](state, data) {
    // sets geolocation to the state
    state.location = data
  },
  [mutationTypes.SET_PRODUCTS](state, data) {
    // sets all products in state
    state.products = data
  },
  [mutationTypes.SET_PRODUCT_CATEGORIES](state, data) {
    // sets all product categories in state
    state.categories = data
  },
  [mutationTypes.SET_PRODUCT](state, data) {
    // sets a single product to the state
    state.singleProduct.product = data
  },
  [mutationTypes.SHIPPING_LOADED](state) {
    // executes when all shipping actions have been accounted for
    state.shippingLoaded = true
  },
  [mutationTypes.SET_SHIPPING_ZONES](state, data) {
    // sets all shipping zones and child arrays for upcoming data for shipping methods and locations
    state.shipping_zones = data
    // create methods and locations array to push to.
    state.shipping_zones.map(zone => {
      zone.methods = []
      zone.locations = []
    })
  },
  [mutationTypes.SET_SHIPPING_ZONE_LOCATIONS](state, data) {
    // see shipping zone methods
    data.forEach(item => {
      let id = Number(item._links.describes[0].href.split('/').pop())
      let zones = state.shipping_zones
      zones.map(zone => {
        if (zone.id === id) zone.locations.push(item)
      })
    })
  },
  [mutationTypes.SET_SHIPPING_ZONE_METHODS](state, data) {
    // see shipping zone methods
    data.forEach(item => {
      // get the id of the parent shipping zone from the API _links object, cast to a number for comparison
      let id = Number(item._links.describes[0].href.split('/').pop())
      // filter existing zones for this particular id
      let zones = state.shipping_zones
      // loop over the zones to check those with the found parent ID
      zones.map(zone => {
        if (zone.id === id) {
          zone.methods.push(item)
        }
      })
    })
  },
  [mutationTypes.SET_PRODUCT_VARIATIONS](state, data) {
    state.singleProduct.variations = data
  },
  [mutationTypes.ADD_TO_CART](state, data) {
    // adds to the cart and updates order.
    // pass this function an object with a minimum of product and quantity
    // e.g:
    // wcProduct and wcVariation are ibjects returned by WC REST
    // { product: wcProduct, variation: wcVariation, quantity: 1 }
    let isVariable = false
    // check each property to see if variable
    for (let item in data) {
      if (data.hasOwnProperty(item)) {
        if (item === 'variation') isVariable = true
      }
    }
    if (isVariable) {
      let existing = state.cart.find(item => { return item.data.variation.id === data.variation.id })
      if (existing !== undefined) {
        // existing variable product
        // 1. add to order
        state.order.line_items.map(li => {
          if (li.variation_id === data.variation.id) li.quantity++
        })
        // 2. add to cart
        existing.quantity++
      } else {
        // new variable product
        // 1. add to order
        state.order.line_items.push({
          product_id: data.product.id,
          quantity: 1,
          variation_id: data.variation.id
        })
        // 2. add to cart
        state.cart.push({
          data: data,
          quantity: 1
        })
      }
    } else {
      let existing = state.cart.find(item => { return item.data.product.id === data.product.id })
      if (existing !== undefined) {
        // existing simple product
        // 1. add to order
        state.order.line_items.map(li => {
          if (li.product_id === data.product.id) li.quantity++
        })
        // 2. add to cart
        existing.quantity++
      } else {
        // new simple product
        // 1. add to order
        state.order.line_items.push({
          product_id: data.product.id,
          quantity: 1
        })
        // 2. add to cart
        state.cart.push({
          data: data,
          quantity: 1
        })
      }
    }
  },
  [mutationTypes.REMOVE_FROM_CART](state, data) {
    let isVariable = false
    // check each property to see if variable
    for (let item in data) {
      if (data.hasOwnProperty(item)) {
        if (item === 'variation') isVariable = true
      }
    }
    if (isVariable) {
      let item = state.cart.find(item => { return item.data.variation.id === data.variation.id })
      if (item.quantity > 1) { // should always exist, though..
        // item variable product
        // 1. remove from order
        state.order.line_items.map(li => {
          if (li.variation_id === data.variation.id) li.quantity--
        })
        // 2. remove from cart
        item.quantity--
      } else {
        // 1. remove from order
        let removeOrder = state.order.line_items.filter(li => { return li.variation_id === data.variation.id })
        let orderIndex = state.order.line_items.indexOf(removeOrder[0])
        if (orderIndex > -1) state.order.line_items.splice(orderIndex, 1) // this does the deletion
        // 2. remove from cart
        let removeCart = state.cart.filter(i => { return i.data.variation.id === data.variation.id })
        let cartIndex = state.cart.indexOf(removeCart[0])
        if (cartIndex > -1) state.cart.splice(cartIndex, 1)
      }
    } else {
      let item = state.cart.find(item => { return item.data.product.id === data.product.id })
      if (item.quantity > 1) {
        state.order.line_items.map(li => {
          if (li.product_id === data.product.id) li.quantity--
        })
        item.quantity--
      } else {
        // 1. remove from order
        let removeOrder = state.order.line_items.filter(li => { return li.product_id === data.product.id })
        let orderIndex = state.order.line_items.indexOf(removeOrder[0])
        if (orderIndex > -1) state.order.line_items.splice(orderIndex, 1) // this does the deletion
        // 2. remove from cart
        let removeCart = state.cart.filter(i => { return i.data.product.id === data.product.id })
        let cartIndex = state.cart.indexOf(removeCart[0])
        if (cartIndex > -1) state.cart.splice(cartIndex, 1)
      }
    }
  },
  [mutationTypes.SET_SHIPPING](state, data) {
    state.order.shipping_lines.splice(0, 1)
    state.order.shipping_lines.push(data)
  },
  [mutationTypes.ADD_CUSTOMER_INFO](state, data) {
    // TODO clean up the state so this mumbo jumbo is not necessary
    let b = state.order.billing
    let s = state.order.shipping
    let sl = state.order.shipping_lines
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
    if (data.shipping_line) { sl.push(data.shipping_line) }
  },
  [mutationTypes.PLACE_ORDER](state, data) {
    // set the response data of the post request to the state
    state.payment.orderResponse = data
  },
  [mutationTypes.PAY_ORDER](state, data) {
    // pay order, set progress to the returned value
    state.payment.progress = data
  },
  [mutationTypes.EMPTY_ORDER](state) {
    // empty order and cart
    state.order = emptyOrder
    state.cart = []
  }
}

const getters = {
  shippingLoadedState: state => state.shippingLoaded,
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
  shippingTotal: (state) => {
    if (state.order.shipping_lines.length > 0) {
      let total = 0
      state.order.shipping_lines.map(line => {
        if (line.total) {
          total += Number(line.total)
        } else {
          total += 0
        }
      })
      return total
    } else return 0
  },
  cartTotal: (state) => {
    let total = 0
    state.cart.map(i => {
      if (i.data.variation) {
        total += Number(i.data.variation.price * i.quantity)
      } else {
        total += Number(i.data.product.price * i.quantity)
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
