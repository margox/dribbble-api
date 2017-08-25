const request = require('request')
const defaultAssessToken = '4455fa6b9d95ab096cc2fb1c12e5714731cd9119802b33555dcca1e3f2ed4a5b'

module.exports = (param) => new Promise((resolve, reject) => {
  param.qs.access_token = param.qs.access_token || defaultAssessToken
  request(param, (err, res, body) => err ? reject(err) : resolve(res, body))
})