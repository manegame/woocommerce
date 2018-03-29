<template>
  <div class='app'>
    <router-view />
  </div>
</template>

<script>
import {mapState, mapActions} from 'vuex'

export default {
  name: 'app',
  data() {
    return {
      meta: {
        sitename: 'WEBSHOP MXDNESS',
        facebook: 'xxxxxxxxx',
        twitter: '@xxxxx',
        title: 'WOOCOMMERCE',
        description: 'xxxx',
        type: 'website',
        image: 'http://xxxx',
        url: 'http://xxxx',
        defaults: {
          title: 'WOOCOMMERCE',
          description: 'xxxx',
          image: 'http://xxxx',
          type: 'website'
        }
      }
    }
  },
  computed: {
    ...mapState(['main'])
  },
  watch: {
    $route(to, from) {
      this.$_fetchData(to)
    }
  },
  mounted() {
    this.$_setMetaTags()
  },
  methods: {
    ...mapActions([
      'GET_PRODUCTS',
      'GET_PRODUCT_VARIATIONS',
      'GET_PRODUCT_CATEGORIES',
      'GET_SHIPPING_ZONES',
      'GET_SHIPPING_ZONE_LOCATIONS',
      'GET_SHIPPING_ZONE_METHODS',
      'GET_PRODUCT',
      'POST_ORDER'
    ]),
    $_setMetaTags(meta = {}) {
      this.meta.title = meta.title || this.meta.defaults.title
      this.meta.description = meta.description || this.meta.defaults.description
      this.meta.image = meta.image || this.meta.defaults.image
      this.meta.type = meta.type || this.meta.defaults.type
      this.meta.url = 'http://xxx.com' + this.$route.fullPath
      this.$emit('updateHead')
    },
    $_fetchData(route) {
      // All requests for data from the server originates from this function
      if (route.name === 'mainView') {
        this.GET_PRODUCTS().then(() => {
          this.main.products.forEach(p => {
            if (p.variations.length > 0) {
              // console.log('get variations also', p.id)
            }
          })
        })
        this.GET_PRODUCT_CATEGORIES()
      }
      if (route.name === 'product') {
        this.GET_PRODUCT(route.params.slug).then(() => {
          this.GET_PRODUCT_VARIATIONS(this.main.singleProduct.product.id)
        })
      }
      if (route.name === 'checkout') {
        this.GET_PRODUCTS()
        this.GET_SHIPPING_ZONES().then(() => {
          console.log('got shipping zones')
          this.main.shipping_zones.forEach(z => {
            // console.log(z)
            this.GET_SHIPPING_ZONE_LOCATIONS(z.id)
          })
        })
      }
    }
  },
  head: {
    title() {
      return {
        inner: this.meta.title
      }
    },
    meta() {
      return [
        {name: 'application-name', content: 'WEBSHXP'},
        {name: 'description', content: this.meta.description},
        // Twitter
        {name: 'twitter:card', content: 'summary'},
        {name: 'twitter:title', content: this.meta.title},
        {name: 'twitter:description', content: this.meta.description},
        {name: 'twitter:site', content: this.meta.twitter},
        {name: 'twitter:creator', content: this.meta.twitter},
        {name: 'twitter:image:src', content: this.meta.image},
        // Facebook / Open Graph
        {property: 'og:title', content: this.meta.title},
        {property: 'og:site_name', content: this.meta.defaults.title},
        {property: 'og:description', content: this.meta.description},
        {property: 'og:type', content: this.meta.type},
        {property: 'og:url', content: this.meta.url},
        {property: 'og:image', content: this.meta.image},
        // {property: 'fb:admins', content: this.meta.facebook},
        // {property: 'fb:app_id', content: this.meta.facebook},
        // Google+ / Schema.org
        {itemprop: 'name', content: this.meta.title},
        {itemprop: 'description', content: this.meta.description},
        {itemprop: 'image', content: this.meta.image}
      ]
    }
  }
}
</script>

<style lang='scss'>
@import './style/helpers/_mixins.scss';
@import './style/helpers/_progressive.css';
@import './style/helpers/_responsive.scss';
@import './style/_variables.scss';

.app {
  font-family: $sans-serif-stack;
  font-size: $font-size;
  line-height: $line-height;
  color: $black;
  background: $white;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

[v-cloak] {
  background: red;
}
</style>
