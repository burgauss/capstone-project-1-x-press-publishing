const express = require('express');
const sqlite = require('sqlite3');

const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');
const issuesRouter = express.Router({mergeParams: true});

issuesRouter.get('/', (req, res, next)=>{
    console.log(`issues router get`);
    // db.all("SELECT * FROM Issue WHERE series_id = $seriesId", {
    //     $seriesId: req.params.
    // })
});

module.exports = issuesRouter;
