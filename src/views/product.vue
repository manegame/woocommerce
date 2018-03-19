<template>
  <div class="product">
    <template v-if='main.singleProduct.product !== ""'>
      <!-- INITIAL -->
      <template v-if='selected === ""'>
        <img :src='main.singleProduct.product.images[0].src' />
        <p>€{{main.singleProduct.product.price}}</p>
      </template>
      <!-- CHANGES BASED ON VARIATION -->
      <template v-else>
        <img :src='variation(selected).image.src' />
        <p>€{{variation(selected).price}}</p>
      </template>
      <!-- DESCRIPTION ETC. -->
      <p v-html='main.singleProduct.product.short_description'/>
      <!-- VARIABLES -->
      <div v-if='main.singleProduct.product.attributes.length > 0'>
        <div v-for='attribute in main.singleProduct.product.attributes'>
          <form v-if='attribute.name === "Size"'>
            <select v-model='selected'>
              <option disabled value=''>Please select a size</option>
              <option v-for='option in attribute.options'
                      :value='option'
                      v-html='option'/>
            </select>
          </form>
        </div>
      </div>
      <!-- BUY -->
      <button type='submit'
              value='buy'
              @click.prevent='buyThis'>Buy</button>
      {{msg}}
    </template>
  </div>
</template>

<script>
import {mapState, mapGetters, mapActions} from 'vuex'
export default {
  name: 'product',
  data() {
    return {
      selected: '',
      msg: ''
    }
  },
  mounted() {},
  updated: function() {
    this.$nextTick(function() {
      // Code that will run only after the
      // entire view has been re-rendered
    })
  },
  computed: {
    ...mapState(['main']),
    ...mapGetters({
      variation: 'productVariationByOption'
    }),
    variableProduct() {
      if (this.main.singleProduct.variations.length > 0) return true
      else return false
    },
    productId() {
      return this.main.singleProduct.product.id
    },
    variationId() {
      return this.variation(this.selected).id
    },
    quantity() {
      return 1
    }
  },
  methods: {
    ...mapActions(['ADD_PRODUCT']),
    buyThis() {
      if (this.variableProduct) {
        console.log('buy a variable product')
        if (this.selected === '') {
          this.msg = 'please select a size'
        } else {
          this.ADD_PRODUCT({
            product_id: this.productId,
            variation_id: this.variationId,
            quantity: this.quantity
          })
          this.msg = 'have fun with your product'
        }
      } else {
        console.log('buy a normal product')
        this.ADD_PRODUCT({
          product_id: this.productId,
          quantity: this.quantity
        })
      }
    }
  }
}
</script>

<style scoped lang='scss'>
@import '../style/helpers/_mixins.scss';
@import '../style/helpers/_responsive.scss';
@import '../style/_variables.scss';

.product {
  width: 200px;

  img {
    width: 100%;
    height: auto;
  }
}
</style>
