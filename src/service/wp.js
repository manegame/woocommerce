import Vue from 'vue'
import VueResource from 'vue-resource'

const API_ROOT = 'http:/0.0.0/wp-json/wp/v2/'

Vue.use(VueResource)

Vue.http.options.crossOrigin = true

export default {
  getPosts() {
    return new Promise((resolve, reject) => {
      Vue.http.get(API_ROOT + 'posts?per_page=5').then(
        response => {
          resolve(response.body)
        },
        response => {
          reject(response)
        }
      )
    })
  }
}
