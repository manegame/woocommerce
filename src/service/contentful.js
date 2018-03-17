import * as contentful from 'contentful'

const client = contentful.createClient({
  space: 'xxx',
  accessToken: 'xxx'
})

export default {
  getPosts() {
    return new Promise((resolve, reject) => {
      client
        .getEntries({
          content_type: 'post'
        })
        .then(response => resolve(response.items))
        .catch(console.error)
    })
  }
}
