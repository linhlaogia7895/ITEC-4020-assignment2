const express = require('express')
const { isObjectIdOrHexString } = require('mongoose')
const router = new express.Router()

// models
const Hero = require(__basedir + '/models/hero')
const Comment = require(__basedir + '/models/comment')

const DEFAULT_HEROES_PER_PAGE = 10
const DEFAULT_COMMENTS_PER_PAGE = 3

/**
 * Some API endpoints in this application are sorted and paginated. Here, we will go over
 * some details about sorting and paginating the resulting heroes.
 * 
 * In this applicaiton, we sort the heroes in our database based on "name" alphabetically
 * so that top results start with A going all the way to Z. To learn how to use sort in mongoose,
 * please visit their documentation: https://mongoosejs.com/docs/api.html#query_Query-sort
 * 
 * Pagination is used to return parts of the results to the user in series of pages.
 * You can read about pagination in mongodb here: https://docs.mongodb.com/manual/reference/method/cursor.skip/#pagination-example
 * For example imagine that maximum number of items per page is 5 and we have 7 items in
 * our database. As a result, we need to return the first 5 elements in the first page.
 * For the second page, we need to `skip` over the first 5 elements and return the remaining
 * elements (up to a maximum of 5). As a result, our query from the database for paginated
 * results would typically look like this:
 *    const results = await Hero.find({...}).sort({...}).skip((page - 1) * limit).limit(limit)
 * Note: `page` is the page that we want to fetch the results for and `limit` is the maximum
 * number of elements allowed per page. In our previous example, limit was 5.
 * Note: the number of pages can be calculated as `Math.ceil(count / limit)`
 * 
 * In this application, we will use the `DEFAULT_HEROES_PER_PAGE` variable as the maximum 
 * number of items per page for the endpoints
 * that return a list of heroes and `DEFAULT_COMMENTS_PER_PAGE` variable as the maximum 
 * number of items per page for the endpoints that return a list of comments.
 */

// GET /heroes -> gets a list of heroes, sorted and paginated
router.get('/heroes', async (req, res) => {
  const page = req.query.page || 1
  await Hero.find({}).sort({name:'asc'}).skip((page-1)*DEFAULT_HEROES_PER_PAGE).limit(DEFAULT_HEROES_PER_PAGE).exec((err, hero) => {
    if (err) return handleError(err);
    res.json(hero)
  });
    
})

// GET /heroes/:id --> gets a hero by id
router.get('/heroes/:id', async (req, res) => {
  const id = req.params.id
  await Hero.findById(id).exec((err, hero) => {
    if (err) return handleError(err);
    res.json(hero)
  });
})

// POST /search/heroes/by-name --> searches for heroes by name, starting with the query provided as JSON object {"query": "..."}, sorted and paginated
/**
 * Note: only return heroes whose names **start** with the provided query. For example, if our request says
 * `{"query": "fla"}`, we need to look for heroes whose names start with `fla` (case **insensitive**) like `Flash`.
 */
router.post('/search/heroes/by-name', async (req, res) => {
  const name = req.body.query
  const page = req.query.page || 1
  await Hero.find({}).sort({name: name}).skip((page-1)*DEFAULT_HEROES_PER_PAGE).limit(DEFAULT_HEROES_PER_PAGE).exec((err, hero) => {
    if (err) return handleError(err);
    res.json(hero)
  });
})

// POST /search/heroes/by-min-stats --> searches for heroes with powerstats greater than or equal to the provided values.
/**
 * Note: here, return heroes with powerstats greater than or equal to the provided values.
 * For example, if the query object is `{"speed": 100, "intelligence": 95}`, we are looking for heroes
 * whose `powerstats.speed` is greater than or equal to 100 **and** `powerstats.intelligence` is greater
 * than or equal to 95. The following powerstats would be acceptable:
 * 
 * "powerstats": {
 *    "intelligence": 100,
 *    "strength": 85,
 *    "speed": 100,
 *    "durability": 100,
 *    "power": 100,
 *    "combat": 50
 *  }
 * 
 */
router.post('/search/heroes/by-min-stats', async (req, res) => {
  const intelligence = req.body.intelligence || 0
  const strength = req.body.strength|| 0
  const speed = req.body.speed || 0
  const durability = req.body.durability || 0
  const power = req.body.power || 0
  const combat = req.body.combat || 0
  const page = req.query.page || 1
  await Hero.where('intelligence').gte(intelligence)
  .where('strength').gte(strength)
  .where('speed').gte(speed)
  .where('durability').gte(durability)
  .where('power').gte(power)
  .where('combat').gte(combat)
  .skip((page-1)*DEFAULT_HEROES_PER_PAGE).limit(DEFAULT_HEROES_PER_PAGE).exec((err, hero) => {
    if (err) return handleError(err);
    res.json(hero)
  });
})

// POST /heroes/:id/comments --> creates a comment for a hero, gets the object structure as JSON
/**
 * Note: here we want to `populate` the hero field.
 * For more information, see: https://mongoosejs.com/docs/populate.html
 */
router.post('/heroes/:id/comments', async (req, res) => {
  const id = req.params.id
  const text = req.body.text
  await Hero.findById(id).exec( async (err, hero) => {
    if (err) return handleError(err);
    const comment = new Comment({
      hero: hero._id,
      text: text
    })
    try {
      const saveComment = await comment.save();
      res.json(saveComment)
    } catch(err) {
      handleError(err)
    }
    
  });
})

// GET /heroes/:id/comments --> gets the comments for a hero, paginated, sorted by posting date (descending, meaning from new to old)
router.get('/heroes/:id/comments', async (req, res) => {
  const id = req.params.id
  const page = req.query.page || 1
  await Hero.findById(id).exec( async (err, hero) => {
    if (err) return handleError(err);
    await Comment.find({hero: hero._id}).sort('-timestamps').skip((page-1)*DEFAULT_COMMENTS_PER_PAGE).limit(DEFAULT_COMMENTS_PER_PAGE).exec( async (err, comment) => {
      if (err) return handleError(err);
      res.json(comment)
    });
  });
})

module.exports = router
