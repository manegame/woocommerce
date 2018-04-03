# M.W.E. (Manegame WooCommerce Engine)

## What is this for?
<p align='center'><a href="https://woocommerce.com/">
<img src="https://woocommerce.com/wp-content/themes/woo/images/logo-woocommerce@2x.png" alt="WooCommerce" width=100>
</a><a href="https://vuejs.org/"><img src="https://vuejs.org/images/logo.png" alt="Vuejs" width=100>
</a><a href="https://vuejs.org/">
<img src="https://s.w.org/style/images/about/standard.png" alt="Vuejs" width=100>
</a></p>


With this setup you can make a highly customizable webshop experience combining the backend power of established Woocommerce and frontend power of the Vue.js framework

## Features

<img style='text-align: center;' src='https://gigaom.com/wp-content/uploads/sites/1/2011/01/swiss1.jpg' alt='features' />

- Payment options (expandable)
  - Credit Card via Stripe

- Woocommerce features in backend
  - stock keeping
  - variable products (diff sizes, colors, etc.)

- Email customers with Sendgrid 
  - get notified when someone places a new order
  - email your customers with e-mail templates made to fit your need

## What you need to start with
- Vuejs frontend including vuex for state management
- A Wordpress installation on an SSL-secured server (HTTPS)
- The MANEGAME WooCommerce REST Payments endpoint plugin

## Setup Wordpress

1. Install and activate beforementioned Wordpress plugins

### Woocommerce
  1. Follow install instructions
  2. Enable REST API
  3. Keys
  
  - Sendgrid for mail

  - Custom endpoint for payments

## Setup Vue side
Wildcard SSL certificate for secure payment (€115 for two years inc. VAT)

vue (+ wp + woocommerce)

Based on vue-cli/webpack




## Build Setup

``` bash
# install dependencies with Yarn (yarnpkg.com)
yarn

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

## Formatting

[prettier](https://github.com/prettier/prettier/) + [standard](https://standardjs.com/)

## (S)CSS method

[BEM](http://getbem.com/)

## Recommended editor

[VS code](https://code.visualstudio.com/)

## Vue-specific style guide

[Vue Style Guide](https://vuejs.org/v2/style-guide/)

## Useful libraries/components

- [swiper](https://github.com/nolimits4web/swiper/)
- [fuse.js](http://fusejs.io/)
- [vue-slideout](https://github.com/vouill/vue-slideout)
- [vue-scrollto](https://github.com/rigor789/vue-scrollto)
- [bulma](https://bulma.io/)
- [perfect-scrollbar](https://github.com/utatti/perfect-scrollbar)
- [reframe.js](https://github.com/dollarshaveclub/reframe.js/)
- [date-fns](https://date-fns.org)
