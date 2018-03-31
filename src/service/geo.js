export default {
  getPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject)
        .then((position) => {
          resolve(position)
        })
        .catch((err) => {
          reject(err.message)
        })
    })
  }
}
