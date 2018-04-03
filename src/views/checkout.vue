<template>
  <div class="checkout">
    <cart />
    {{msg}}<br />
    <!-- BEGIN FORM -->
    <form @submit.prevent='pay' @change='validate(); setShippingInfo($event); setShippingZone($event)'>
      <!-- START BILLING -->
      <fieldset id='billing'>
        <legend>Billing</legend>
        <input type="text"
              placeholder='first name'
              v-model='billing.firstName'/><br />
        <input type="text"
              placeholder='last name'
              v-model='billing.lastName'/><br />
        <input type="text"
              placeholder='address'
              v-model='billing.address'/><br />
        <input type="text"
              placeholder='city'
              v-model='billing.city'/><br />
        <input type="text"
              placeholder='state'
              v-model='billing.state'/><br />
        <input type="text"
              placeholder='postcode'
              v-model='billing.postcode'/><br />
        <select v-model='billing.country'>
          <option v-for='country in main.countryList' 
                  :value='country[1]'
                  :key='"billing-"+country[1]+"-"+country[3]'
                  v-html='country[4]' />
        </select><br>
        <input type="text"
              placeholder='email'
              v-model='billing.email'/>
        <input type="text"
              placeholder='phone'
              v-model='billing.phone'/>
      </fieldset>
      <!-- END BILLING -->
      <loader v-if='!shippingLoaded' />
      <!-- START SHIPPING -->
       <fieldset id='shipping' v-else>
         <legend>Shipping</legend>
         <input type="checkbox" v-model='sameAsBilling' /><label>Use the same address</label><br>
         <template v-if='!sameAsBilling'>
          <input type="text"
                  placeholder='first name'
                  v-model='shipping.firstName'/><br />
          <input type="text"
                  placeholder='last name'
                  v-model='shipping.lastName'/><br />
          <input type="text"
                  placeholder='address'
                  v-model='shipping.address'/><br />
          <input type="text"
                  placeholder='city'
                  v-model='shipping.city'/><br />
          <input type="text"
                  placeholder='state'
                  v-model='shipping.state'/><br />
          <input type="text"
                  placeholder='postcode'
                  v-model='shipping.postcode'/><br />
        <select v-model='shipping.country'>
          <option v-for='country in main.countryList' 
                  :value='country[1]'
                  :key='"shipping-"+country[1]+"-"+country[3]'
                  v-html='country[4]' />
        </select><br>
        </template>
        <!-- START SHIPPING METHODS -->
        <fieldset v-if='shippingZone !== null' 
                  @change='setShippingMethod($event)'
                  id='shipping_methods'>
          Shipping zone: {{shippingZone.name}} <br/>
          <template v-for='(method, index) in shippingZone.methods'>
            <!-- Flat Rate -->
            <template v-if='method.method_id === "flat_rate"'>
              <input type='radio' 
                      :id='index' 
                      :value='method.method_id' 
                      v-model='selectedShippingMethod' 
                      :key='index'/>
              <label :key='"fl-" + index' 
                      v-html='method.method_title' />
              €{{method.settings.cost.value}}
            </template>
            <!-- Local Pickup -->
            <template v-if='method.method_id === "local_pickup"'>
              <input type='radio' 
                      :id='index' 
                      :value='method.method_id'
                      v-model='selectedShippingMethod' 
                      :key='index'/>
              <label :key='"lp-" + index' 
                      v-html='method.method_title' />
            </template>
            <!-- Free Shipping -->
            <template v-if='method.method_id === "free_shipping"'>
              <input type='radio' 
                      :id='index' 
                      :value='method.method_id'
                      :disabled='cartTotal < method.settings.min_amount.value'
                      v-model='selectedShippingMethod' 
                      :key='index'/>
              <label :key='"fs-" + index' 
                      v-html='method.method_title' />
              for orders above €{{method.settings.min_amount.value}}
            </template>
          </template>
        </fieldset>
        <!-- END SHIPPING METHODS -->
       </fieldset>
       <!-- END SHIPPING -->
       <!-- START PAYMENT -->
       <fieldset id='payment'>
         <legend>Payment</legend>
         <card class='stripe-card'
               :class='{ complete }'
               stripe='pk_test_dmBWXf8cUVhaeZeM4lLwWgae'
               :options='stripeOptions'
               @change='complete = $event.complete'/>
          <input class='pay-with-stripe' type='submit' value='Pay with credit card' :disabled='!complete'>
       </fieldset>
       <!-- END PAYMENT -->
    </form>
    <!-- END FORM -->

  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import loader from '@/components/base/loader'
import cart from '@/components/cart'
import { Card, createToken } from 'vue-stripe-elements'

export default {
  name: 'checkout',
  components: {
    loader,
    cart,
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
    ...mapState(['main']),
    ...mapGetters({
      shippingLoaded: 'shippingLoadedState',
      cartTotal: 'cartTotal'
    }),
    validForm() {
      console.log('computing')
      if (this.firstName === '') return false
    }
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
      this.selectedCountry = this.main.countryList.find(c => { return c[1] === this.shipping.country })
      const continentCode = this.selectedCountry[0]
      const countryCode = this.selectedCountry[1]
      // make an array which contains the id of the shipping zone and locations
      const flatData = []
      this.main.shipping_zones.map(zone => {
        zone.locations.forEach(location => flatData.push({ location: location, id: zone.id }))
      })
      const byCountry = flatData.find(item => item.location.code === countryCode)
      const byContinent = flatData.find(item => item.location.code === continentCode)
      // set shippingZone
      if (byCountry !== undefined) {
        // try by country
        this.shippingZone = this.main.shipping_zones.find(zone => zone.id === byCountry.id)
      } else if (byContinent !== undefined) {
        // try by continent
        this.shippingZone = this.main.shipping_zones.find(zone => zone.id === byContinent.id)
      } else {
        // set to `other`
        this.shippingZone = this.main.shipping_zones.find(zone => zone.id === 0)
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
        console.log(this.main.order)
        this.PLACE_ORDER(this.main.order).then(() => {
          if (this.main.payment.orderResponse.message) {
            this.msg = 'sorry, something went wrong. Please refresh and try again...'
            return
          }
          createToken().then(result => {
            if (result.token) {
              let data = {
                order_id: this.main.payment.orderResponse.id,
                payment_token: result.token.id,
                payment_method: 'stripe'
              }
              this.PAY_ORDER(data).then(() => {
                this.msg = this.main.payment.progress.message
                if (this.main.payment.progress.code === 405) {

                }
                if (this.main.payment.progress.code === 200) {
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
</script>

<style scoped lang='scss'>
@import '../style/helpers/_mixins.scss';
@import '../style/helpers/_responsive.scss';
@import '../style/_variables.scss';

.valid {
  border-color: green;
}

.stripe-card {
  width: 300px;
  border: 1px solid grey;
}
.stripe-card.complete {
  border-color: green;
}


.checkout {
  &__item {
    width: 200px;

    img {
      width: 100%;
    }
  }
}
</style>
