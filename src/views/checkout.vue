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
          <option v-for='country in shop.countryList' 
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
          <option v-for='country in shop.countryList' 
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
               :stripe='stripeKey'
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
import checkout from '@/components/shop/checkout'
import loader from '@/components/base/loader'
import cart from '@/components/cart'

export default {
  name: 'checkout',
  components: {
    loader,
    cart
  },
  data() {
    return {
      stripeKey: 'pk_test_dmBWXf8cUVhaeZeM4lLwWgae'
    }
  },
  mixins: [checkout]
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
