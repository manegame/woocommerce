import Vue from 'vue'
import VueResource from 'vue-resource'
import WooCommerceAPI from 'woocommerce-api'

const API_ROOT = 'https://tests.manusnijhoff.nl/'
const CONSUMER_KEY = 'ck_6d597689284fad3986649141fb63191723f74a09'
const CONSUMER_SECRET = 'cs_cd7cf3a6ee5ddf785a0596c0e4deb811a295ab92'
// endpoints
// orders, payment, products

Vue.use(VueResource)
//
Vue.http.options.crossOrigin = true

const WooCommerce = new WooCommerceAPI({
  url: API_ROOT,
  consumerKey: CONSUMER_KEY,
  consumerSecret: CONSUMER_SECRET,
  wpAPI: true,
  version: 'wc/v2'
})

export default {
  getProducts() {
    return new Promise((resolve, reject) => {
      WooCommerce.getAsync('products').then(
        response => {
          resolve(JSON.parse(response.toJSON().body))
        },
        response => {
          reject(response)
        }
      )
    })
  },
  getProduct(slug) {
    return new Promise((resolve, reject) => {
      WooCommerce.getAsync('products?slug=' + slug + '').then(
        response => {
          resolve(JSON.parse(response.toJSON().body)[0])
        },
        response => {
          reject(response)
        }
      )
    })
  },
  getProductVariations(id) {
    return new Promise((resolve, reject) => {
      WooCommerce.getAsync('products/' + id + '/variations').then(
        response => {
          resolve(JSON.parse(response.toJSON().body))
        },
        response => {
          reject(response)
        }
      )
    })
  },
  getProductCategories() {
    return new Promise((resolve, reject) => {
      WooCommerce.getAsync('products/categories').then(
        response => {
          resolve(JSON.parse(response.toJSON().body))
        },
        response => {
          reject(response)
        }
      )
    })
  },
  getShippingZones() {
    return new Promise((resolve, reject) => {
      WooCommerce.getAsync('shipping/zones').then(
        response => {
          resolve(JSON.parse(response.toJSON().body))
        },
        response => {
          reject(response)
        }
      )
    })
  },
  getShippingZoneLocations(id) {
    return new Promise((resolve, reject) => {
      WooCommerce.getAsync('shipping/zones/' + id + '/locations').then(
        response => {
          console.log(JSON.parse(response.toJSON().body)[0])
          resolve(JSON.parse(response.toJSON().body))
        },
        response => {
          reject(response)
        }
      )
    })
  },
  getShippingZoneMethods(id) {
    return new Promise((resolve, reject) => {
      WooCommerce.getAsync('shipping/zones/' + id + '/methods').then(
        response => {
          resolve(JSON.parse(response.toJSON().body))
        },
        response => {
          reject(response)
        }
      )
    })
  },
  placeOrder(data) {
    return new Promise((resolve, reject) => {
      WooCommerce.postAsync('orders', data).then(
        response => {
          resolve(JSON.parse(response.toJSON().body))
        },
        response => {
          reject(response)
        }
      )
    })
  },
  payOrder(data) {
    return new Promise((resolve, reject) => {
      WooCommerce.postAsync('manegame-payment', data).then(
        response => {
          console.log('Thank you for shopping with Manegame')
          resolve(JSON.parse(response.toJSON().body))
        },
        response => {
          console.log('payment rejected')
          reject(response)
        }
      )
    })
  }
}
