<template>
  <div class="checkout">
    {{msg}}<br />
    billing complete: {{billingComplete}}

    <form @submit.prevent='pay' @change='validate'>
      <label>Billing</label><br/>
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
      <input type="text"
             placeholder='country'
             v-model='billing.country'/>
      <input type="text"
             placeholder='email'
             v-model='billing.email'/>
      <input type="text"
             placeholder='phone'
             v-model='billing.phone'/>
       <br/>
       <label>Shipping</label><br/>
       <input type="checkbox" v-model='sameAsBilling' /><label>Same as billing address</label><br/>
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
         <input type="text"
                placeholder='country'
                v-model='shipping.country'/><br />
       </template>

       <p>Payment</p>
       <card class='stripe-card'
             :class='{ complete }'
             stripe='pk_test_dmBWXf8cUVhaeZeM4lLwWgae'
             :options='stripeOptions'
             @change='complete = $event.complete' />

       <input class='pay-with-stripe' type='submit' value='Pay with credit card' :disabled='!complete'>
    </form>
    <cart />
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import cart from '@/components/cart'
import { Card, createToken } from 'vue-stripe-elements'

export default {
  name: 'checkout',
  components: {
    cart,
    Card
  },
  data() {
    return {
      msg: '',
      errors: [],
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
        country: null,
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
        country: null
      }
    }
  },
  computed: {
    ...mapState(['main']),
    ...mapGetters({
      product: 'productById',
      variation: 'variationById'
    }),
    validForm() {
      console.log('computing')
      if (this.firstName === '') return false
    }
  },
  mounted: function() {
    this.$nextTick(function() {
      // Code that will run only after the
      // entire view has been re-rendered
    })
  },
  methods: {
    ...mapActions([
      'ADD_CUSTOMER_INFO',
      'PLACE_ORDER',
      'PAY_ORDER'
    ]),
    validate() {
      this.missingBilling = []
      Object.keys(this.billing).forEach(key => {
        if (key !== 'state') { // exceptions
          if (this.billing[key] === null) this.missingBilling.push(key)
        }
      })
      if (this.missingBilling.length === 0) this.billingComplete = true
      else this.billingComplete = false
    },
    pay() {
      let data = {
        sameAsBilling: this.sameAsBilling,
        billing: '',
        shipping: ''
      }
      if (this.sameAsBilling) {
        data.billing = this.billing
        data.shipping = this.billing
      } else {
        data.billing = this.billing
        data.shipping = this.shipping
      }
      this.ADD_CUSTOMER_INFO(data).then(() => {
        console.log('added customer info')
        this.complete = false
        this.msg = 'hold on, placing order...'
        if (!this.billingComplete) {
          this.msg = 'please fill in the missing fields'
          return
        }
        this.msg = 'hold on, processing payment...'
        this.PLACE_ORDER(this.main.order).then(() => {
          if (this.main.payment.orderResponse.code === 'rest_invalid_param') {
            this.msg = 'please check if you\'ve filled in your infos correctly'
            // console.log(this.main.orderResponse)
            return
          }
          createToken().then(result => {
            if (result.token) {
              console.log(result.token)
              let data = {
                order_id: this.main.payment.orderResponse.id,
                payment_token: result.token.id,
                payment_method: 'stripe'
              }
              this.PAY_ORDER(data).then(() => {
                if (this.main.payment.progress.code === 200) {
                  this.msg = this.main.payment.progress.message
                  console.log('payment complete')
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
