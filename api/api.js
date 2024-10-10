const express = require('express');
const artistsRouter = require('./artists.js');

const apiRouter = express.Router();

apiRouter.use('/artists', artistsRouter);

module.exports = apiRouter;