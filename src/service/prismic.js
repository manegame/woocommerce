import Prismic from 'prismic-javascript'

const apiEndpoint = 'https://xxxxxxx.prismic.io/api/v2'

export default {
  getPosts() {
    return new Promise((resolve, reject) => {
      Prismic.getApi(apiEndpoint)
        .then(api => {
          return api.query('')
        })
        .then(
          response => {
            resolve(response.results)
          },
          err => {
            console.log('Something went wrong: ', err)
            reject(err)
          }
        )
    })
  }
}
