const ShotController = require('../controllers/shot')

module.exports = (router) => {

  router.get('/', async (ctx, next) => {

    ctx.body = 'Hello World!'
    await next()

  })

  router.get('/shots/popular', ShotController.getPopularShots)
  router.get('/shots/recent', ShotController.getRecentShots)
  router.get('/shots/gifs', ShotController.getAnimatedShots)
  router.get('/shots/liked', ShotController.getLikedShots),
  router.get('/shots/search', ShotController.searchShots),
  router.get('/bucket/shots', ShotController.getShotsInBucket)

}