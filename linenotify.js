const axios = require('axios')

module.exports = {
  sendmessage: async (message, paramToken) => {
    return new Promise((resolve, reject) => {
      const linereq = axios({
        method: 'post',
        url: 'https://notify-api.line.me/api/notify',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${paramToken}`,
        },
        data: "message=" + message,
        })
        .then(() => {
        console.log(`line noti success`)
        resolve(linereq)
        })
        .catch(error =>{
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
      })
    })
  }
}

// new Promise((response, reject) => {
//   const linereq = axios({
//     method: 'post',
//     url: 'https://notify-api.line.me/api/notify',
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded',
//       'Authorization': `Bearer ${token}`,
//     },
//     data: "message=" + msgHeader + "\n\n" + mainContent,
//   })
//   .then(() => {
//     console.log(`line noti success`)
//     resolve()
//   })
//   .catch(error =>{
//     if (error.response) {
//       console.log(error.response.data);
//       console.log(error.response.status);
//       console.log(error.response.headers);
//     }
//   })
// })