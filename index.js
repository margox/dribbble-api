const cheerio = require('cheerio')
const http = require('http')
const https = require('https')
const url  = require('url')

const access_token = '*****'

const objToUrl = (obj) => {

  var result = ''

  Object.keys(obj).forEach(key => {
    result += ('&' + key + '=' + obj[key])
  })

  return result

}

const server = http.createServer((req, res) => {
  let html = ''
  const { query } = url.parse(req.url, true)
  if (query.type === 'search') {
    https.get({
      hostname: 'dribbble.com',
      path: '/search?per_page=12&page=' + query.page + '&q=' + encodeURIComponent(query.q),
      headers: {
        'Cookie': 'shot_size_preference=large;shot_meta_preference=with;'
      }
    }, (subres) => {
      subres.on('data', (data) => {
        html += data.toString()
      })
      subres.on('end', () => {
        let $ = cheerio.load(html)
        let shotEles = $('#main .dribbbles li.group')
        let newestShots = []
        try {
          newestShots = eval(html.match(/(newestShots = )(\[\{[\s\S]*\}\])/)[0].replace('newestShots = ', ''))
        } catch (e) {
          newestShots = new Array(shotEles.length).fill({})
        }
        let json = []
        shotEles.each((index, item) => {
          if (index > shotEles.length - 1) {
            return false
          }
          item = $(item)
          json.push({
            id: newestShots[index].id || item.attr('id').replace('screenshot-', '') * 1,
            title: item.find('.dribbble-over strong').text(),
            url: item.find('.dribbble-img picture source').eq(0).attr('srcset'),
            attachments_count: newestShots[index].attachments_count || 0,
            likes_count: newestShots[index].likes_count || item.find('li.fav a').last().text(),
            views_count: newestShots[index].view_count || item.find('li.views span').text(),
            comments_count: newestShots[index].comments_count || item.find('li.cmnt span').text(),
            user: {
              name: item.find('.attribution-user .url').text(),
              avatar_url: item.find('.attribution-user .photo').attr('src')
            }
          })
        })
        res.end(JSON.stringify(json))
      })
    })
  } else if (query.type === 'shots') {
    let json = ''
    let param = Object.assign({}, query, { access_token })
    delete param.type
    param = objToUrl(param)
    https.get({
      hostname: 'margox.cn',
      path: '/api/dribbble/shots?' + param,
    }, (subres) => {
      subres.on('data', (data) => {
        json += data.toString()
      })
      subres.on('end', () => {
        try {
          let shots = JSON.parse(json)
          if (shots instanceof Array) {
            res.end(JSON.stringify(shots.map(item => {
              const { id, name, username, avatar_url, pro } = item.user
              item.user = { id, name, username, avatar_url, pro }
              delete item.team
              delete item.description
              return item
            })))
          } else {
            res.end('[]')
          }
        } catch (e) {
          res.end('{"message": "Unknow Error."}')
        }
      })
    })
  } else if (query.type === 'shot') {
    let json = ''
    let param = { access_token }
    param = objToUrl(param)
    https.get({
      hostname: 'margox.cn',
      path: '/api/dribbble/shots/' + query.shot_id + '?' + param,
    }, (subres) => {
      subres.on('data', (data) => {
        json += data.toString()
      })
      subres.on('end', () => {
        try {
          let shot = JSON.parse(json)
          if (shot && shot.id) {
            const { id, name, username, avatar_url, pro } = shot.user
            shot.user = { id, name, username, avatar_url, pro }
            delete shot.team
            res.end(JSON.stringify(shot))
          } else {
            res.end('{}')
          }
        } catch (e) {
          res.end('{"message": "Unknow Error."}')
        }
      })
    })
  } else if (query.type === 'shot_meta') {
    let json = ''
    let param = Object.assign({}, query, { access_token })
    delete param.type
    delete param.shot_id
    delete param.meta_name
    param = objToUrl(param)
    https.get({
      hostname: 'margox.cn',
      path: '/api/dribbble/shots/' + query.shot_id + '/' + query.meta_name + '?' + param,
    }, (subres) => {
      subres.on('data', (data) => {
        json += data.toString()
      })
      subres.on('end', () => {
        try {
          if (query.meta_name=== 'comments') {
            let metas = JSON.parse(json)
            if( metas instanceof Array) {
              res.end(JSON.stringify(metas.map(item => {
                const { id, name, username, avatar_url, pro } = item.user
                item.user = { id, name, username, avatar_url, pro }
                delete item.team
                delete item.description
                return item
              })))
            } else {
              res.end('[]')
            }
          } else {
            res.end(json)
          }
        } catch (e) {
          res.end('{"message": "Unknow Error."}')
        }
      })
    })
  } else {
    res.end('{"message": "Unknow Type."}')
  }

})

server.listen(9090)
