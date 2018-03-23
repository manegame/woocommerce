<template>
  <div class="checkout">
    <form>
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
    </form>

    <input type="submit" @click='submit'/>

    <!-- <p>Please give us your payment details:</p>
    <card class='stripe-card'
          :class='{ complete }'
          stripe='pk_test_dmBWXf8cUVhaeZeM4lLwWgae'
          :options='stripeOptions'
          @change='complete = $event.complete' />

    <button class='pay-with-stripe' @click='pay' :disabled='!complete'>Pay with credit card</button> -->

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
      complete: false,
      order_id: 33,
      stripeOptions: {
        // see https://stripe.com/docs/stripe.js#element-options for details
      },
      sameAsBilling: true,
      billing: {
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        postcode: '',
        country: '',
        email: '',
        phone: ''
      },
      shipping: {
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        postcode: '',
        country: ''
      }
    }
  },
  computed: {
    ...mapState(['main']),
    ...mapGetters({
      product: 'productById',
      variation: 'variationById'
    })
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
      'PLACE_ORDER'
    ]),
    submit() {
      let data = {
        sameAsBilling: this.sameAsBilling,
        billing: '',
        shipping: ''
      }
      if (this.sameAsBilling) {
        data.billing = this.billing
        data.shipping = this.billing
        this.ADD_CUSTOMER_INFO(data).then(() => {
          console.log('place order')
          this.PLACE_ORDER(this.main.order)
        })
        console.log(data)
      } else {
        data.billing = this.billing
        data.shipping = this.shipping
        this.ADD_CUSTOMER_INFO(data).then(() => {
          console.log('place order')
          this.PLACE_ORDER(this.main.order)
        })
      }
    },
    pay () {
      // createToken returns a Promise which resolves in a result object with
      // either a token or an error key.
      // See https://stripe.com/docs/api#tokens for the token object.
      // See https://stripe.com/docs/api#errors for the error object.
      // More general https://stripe.com/docs/stripe.js#stripe-create-token.
      createToken().then(result => {
        console.log(result.token)
        if (result.token) {
          console.log('send token to server', result.token.id, this.order_id)
        } else {
          console.log('there was a problemmmm', result)
        }
      })
    }
  }
}
</script>

<style scoped lang='scss'>
@import '../style/helpers/_mixins.scss';
@import '../style/helpers/_responsive.scss';
@import '../style/_variables.scss';

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
