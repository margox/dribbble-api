const cheerio = require('cheerio')
const request = require('../utils/request')

module.exports = {

  listShots: async (param) => {

    let { list, sort, page, access_token } = param
    page = page || 1

    let shots = await request({
      url: 'https://margox.cn/api/dribbble/shots',
      qs: { list, sort, page, access_token }
    })

    return shots.body || []

  },

  listShotsWithAccessToken: async (param) => {

    let shots = {}
    let { type, page, access_token } = param

    if (!access_token) {
      return []
    }

  },

  searchShots: async (param) => {

    let { q, page, per_page } = param
    per_page = per_page || 12
    page = page || 1
    q = encodeURIComponent(q)

    let resultHTML = await request({
      url: 'https://dribbble.com/search',
      qs: { q, page, per_page },
      headers: {
        'Cookie': 'shot_size_preference=large;shot_meta_preference=with;'
      }
    })

    resultHTML = resultHTML.body

    let $ = cheerio.load(resultHTML)
    let shotEles = $('#main .dribbbles li.group')
    let newestShots = []
    let json = []

    try {
      newestShots = eval(resultHTML.match(/(newestShots = )(\[\{[\s\S]*\}\])/)[0].replace('newestShots = ', ''))
    } catch (e) {
      newestShots = new Array(shotEles.length).fill({})
    }

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

    return json

  }

}