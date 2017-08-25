const ShotService = require('../services/shot')

module.exports = {

  searchShots: async (ctx) => {
    ctx.body = await ShotService.searchShots(ctx.query)
  },

  getPopularShots: async (ctx) => {
    ctx.body = await ShotService.listShots(ctx.query)
  },

  getRecentShots: async (ctx) => {
    ctx.body = await ShotService.listShots({
      ...ctx.query,
      sort: 'recent'
    })
  },

  getAnimatedShots: async (ctx) => {
    ctx.body = await ShotService.listShots({
      ...ctx.query,
      list: 'animated'
    })
  },

  likeShot: async (ctx) => {

  },

  unlikeShot: async (ctx) => {
    
  }

}