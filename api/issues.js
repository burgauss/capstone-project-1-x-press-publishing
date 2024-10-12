const express = require('express');
const sqlite = require('sqlite3');

const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');
const issuesRouter = express.Router({mergeParams: true});

issuesRouter.get('/', (req, res, next)=>{
    db.all("SELECT * FROM Issue WHERE series_id = $seriesId",{$seriesId: req.params.seriesId}, (err, issues) => {
        if(err){
            next(err);
        } else{
            res.status(200).send({issues: issues});
        }

    })
});

issuesRouter.post('/', (req, res, next)=>{
    const {name, issueNumber, publicationDate, artistId} = req.body.issue;
    if (!name || !issueNumber || !publicationDate || !artistId){
        return res.status(400).send();
    }
    db.get("SELECT * FROM Artist WHERE id =$artistId", {$artistId:artistId}, (err, artist) =>{
        if (err){
            next(err);
        }
        if (!artist){
            return res.status(400).send();
        }
        db.run(`INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) 
            VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)`, {
                $name: name,
                $issueNumber: issueNumber,
                $publicationDate: publicationDate,
                $artistId:artistId,
                $seriesId: req.params.seriesId
            }, function(err){
                if (err){
                    next(err)
                    return res.status(500).send();
                }
                db.get(`SELECT * FROM Issue WHERE id = ${this.lastID}`, (err, issue) => {
                    if (!issue) {
                        return res.sendStatus(500);
                    }
                    res.status(201).send({issue: issue});
                    });

            })
    })
})

issuesRouter.param('issueId', (req, res, next, id)=>{
    db.get("SELECT * FROM Issue WHERE id = $id", {$id:id}, (err, issue) =>{
        if (err){
            return next(err);
        } 
        if (issue){
            req.issue = issue;
            next();
        } else{
            return res.status(404).send("The issue was not found");
        }
    })  
})


issuesRouter.put('/:issueId', (req, res, next) => {
    const {name, issueNumber, publicationDate, artistId} = req.body.issue;
    if (!name || !issueNumber || !publicationDate || !artistId){
        return res.status(400).send();
    }
    db.get("SELECT * FROM Artist WHERE id =$artistId", {$artistId:artistId}, (err, artist) =>{
        if (err){
            next(err);
        }
        if (!artist){
            return res.status(400).send();
        }
        db.run(`UPDATE Issue SET name=$name, 
            issue_number=$issueNumber, 
            publication_date=$publicationDate, 
            artist_id = $artistId,
            series_id = $seriesId WHERE
            id = $id
            `, {
                $name:name,
                $issueNumber:issueNumber,
                $publicationDate:publicationDate,
                $artistId:artistId,
                $seriesId:req.params.seriesId,
                $id:req.issue.id
            }, function(err){
                if (err){
                    next(err);
                    return res.status(500).send();
                }
                db.get(`SELECT * FROM Issue WHERE id = ${req.issue.id}`, (err, issue) => {
                    if (!issue) {
                        return res.sendStatus(500);
                    }
                    res.send({issue: issue});
                    });
            })
    })
})

issuesRouter.delete('/:issueId', (req, res, next)=>{
    console.log("delete hit!");
    db.run('DELETE FROM Issue WHERE id=$id', {$id:req.issue.id}, function(err){
        if(err){
            next(err);
            return res.status(500).send();
        }
        res.status(204).send();
    })
})


module.exports = issuesRouter;
