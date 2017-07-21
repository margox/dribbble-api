const cheerio = require('cheerio')
const http = require('http')
const https = require('https')
const url  = require('url')

const server = http.createServer((req, res) => {
  let html = ''
  const { query } = url.parse(req.url, true)
  if (query.type === 'search') {
    https.get('https://dribbble.com/search?per_page=12&page=' + query.page + '&q=' + query.q, (subres) => {
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
            url: item.find('.dribbble-img img').attr('src'),
            attachments_count: newestShots[index].attachments_count || 0,
            likes_count: newestShots[index].likes_count || item.find('li.fav a').last().text(),
            view_count: newestShots[index].view_count || item.find('li.views span').text(),
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
  } else {
    res.end('{message: "Unknow Type."}')
  }

})

server.listen(9090)