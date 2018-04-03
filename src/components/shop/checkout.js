import { mapState, mapActions, mapGetters } from 'vuex'
import { Card, createToken } from 'vue-stripe-elements'

export default {
  components: {
    Card
  },
  data() {
    return {
      msg: '',
      billingComplete: false,
      complete: false,
      stripeOptions: {
        // see https://stripe.com/docs/stripe.js#element-options for details
        hidePostalCode: true,
        iconStyle: 'default'
      },
      token: '',
      sameAsBilling: true,
      missingBilling: [],
      billing: {
        firstName: null,
        lastName: null,
        address: null,
        city: null,
        state: '',
        postcode: null,
        country: 'NL',
        email: null,
        phone: null
      },
      shipping: {
        firstName: null,
        lastName: null,
        address: null,
        city: null,
        state: null,
        postcode: null,
        country: 'NL'
      },
      selectedCountry: 'NL',
      selectedShippingMethod: 'flat_rate',
      shippingZone: null,
      shippingFee: 0
    }
  },
  computed: {
    ...mapState(['shop']),
    ...mapGetters({ shippingLoaded: 'shippingLoadedState', cartTotal: 'cartTotal' })
  },
  methods: {
    ...mapActions([
      'ADD_CUSTOMER_INFO',
      'SET_SHIPPING',
      'PLACE_ORDER',
      'PAY_ORDER'
    ]),
    validate() {
      console.log(1, 'checks missing billing information and sets this to missingBilling array')
      this.missingBilling = []
      Object.keys(this.billing).forEach(key => {
        if (key !== 'state') { // exceptions
          if (this.billing[key] === null) this.missingBilling.push(key)
        }
      })
      if (this.missingBilling.length === 0) this.billingComplete = true
      else this.billingComplete = false
    },
    setShippingInfo() {
      console.log(2, '')
      // only set the billing info to shipping when billing is the same as shipping info
      if (this.sameAsBilling) {
        // if not, set same info as the billing address
        this.shipping.firstName = this.billing.firstName
        this.shipping.lastName = this.billing.lastName
        this.shipping.address = this.billing.address
        this.shipping.city = this.billing.city
        this.shipping.state = this.billing.state
        this.shipping.postcode = this.billing.postcode
        this.shipping.country = this.billing.country
      }
    },
    setShippingZone(event) {
      console.log(3, event)
      // prepare country filtering
      this.selectedCountry = this.shop.countryList.find(c => { return c[1] === this.shipping.country })
      const continentCode = this.selectedCountry[0]
      const countryCode = this.selectedCountry[1]
      // make an array which contains the id of the shipping zone and locations
      const flatData = []
      this.shop.shipping_zones.map(zone => {
        zone.locations.forEach(location => flatData.push({ location: location, id: zone.id }))
      })
      const byCountry = flatData.find(item => item.location.code === countryCode)
      const byContinent = flatData.find(item => item.location.code === continentCode)
      // set shippingZone
      if (byCountry !== undefined) {
        // try by country
        this.shippingZone = this.shop.shipping_zones.find(zone => zone.id === byCountry.id)
      } else if (byContinent !== undefined) {
        // try by continent
        this.shippingZone = this.shop.shipping_zones.find(zone => zone.id === byContinent.id)
      } else {
        // set to `other`
        this.shippingZone = this.shop.shipping_zones.find(zone => zone.id === 0)
      }
      if (event !== undefined && event.srcElement.parentElement.id !== 'shipping_methods') {
        console.log('set from setShippingZone')
        this.setShippingMethod()
      }
    },
    setShippingMethod(event) {
      if (event) {
        console.log('setting shipping method from an event', event)
      } else {
        console.log(4, 'setting shipping method without an event')
        let freeShipping = this.shippingZone.methods.find(method => { return method.method_id === 'free_shipping' })
        if (freeShipping !== undefined) {
          let floor = Number(freeShipping.settings.min_amount.value)
          console.log('what', this.cartTotal, floor)
          if (this.cartTotal > floor && this.selectedShippingMethod !== 'local_pickup') {
            this.selectedShippingMethod = 'free_shipping'
          } else if (this.cartTotal < floor && this.selectedShippingMethod === 'free_shipping') {
            this.selectedShippingMethod = 'flat_rate'
          }
        }
        if (this.selectedShippingMethod === undefined || this.selectedShippingMethod === null) {
          this.selectedShippingMethod = 'flat_rate'
        }
        // check which shipping methods are available and handle them
        let method = this.shippingZone.methods.find(m => { return m.method_id === this.selectedShippingMethod })
        let shipMe = {}
        if (method !== undefined) {
          shipMe.method_id = method.method_id
          shipMe.method_title = method.method_title
          if (method.method_id === 'flat_rate') {
            shipMe.total = method.settings.cost.value
          }
        }
        this.SET_SHIPPING(shipMe)
      }
    },
    pay() {
      // shipping and line items are already set...
      this.ADD_CUSTOMER_INFO({
        billing: this.billing,
        shipping: this.shipping
      }).then(() => {
        this.complete = false
        this.msg = 'hold on, placing order...'
        if (!this.billingComplete) {
          this.msg = 'please fill in the missing fields'
          return
        }
        this.msg = 'hold on, processing payment...'
        console.log(this.shop.order)
        this.PLACE_ORDER(this.shop.order).then(() => {
          if (this.shop.payment.orderResponse.message) {
            this.msg = 'sorry, something went wrong. Please refresh and try again...'
            return
          }
          createToken().then(result => {
            if (result.token) {
              let data = {
                order_id: this.shop.payment.orderResponse.id,
                payment_token: result.token.id,
                payment_method: 'stripe'
              }
              this.PAY_ORDER(data).then(() => {
                this.msg = this.shop.payment.progress.message
                if (this.shop.payment.progress.code === 405) {

                }
                if (this.shop.payment.progress.code === 200) {
                  // redirect user
                  this.$router.push({ name: 'order-complete' })
                }
              })
            } else {
              console.log('something went wrong, ', result)
              this.msg = 'sorry, something went wrong'
            }
          })
        })
      })
    }
  },
  watch: {
    cartTotal(newV, oldV) {
      this.setShippingMethod()
    },
    shippingLoaded(newV, oldV) {
      if (newV) {
        // if evals to true, shipping has loaded
        this.setShippingZone()
        this.setShippingInfo()
      }
    }
  }
}
