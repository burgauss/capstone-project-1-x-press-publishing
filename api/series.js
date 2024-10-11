const express = require('express');
const sqlite = require('sqlite3');
const issuesRouter = require('./issues.js');

const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');
const seriesRouter = express.Router();

seriesRouter.param('seriesId', (req, res, next, id) =>{
    db.get("SELECT * FROM Series WHERE id = $id", {$id:id}, (err, serie) =>{
        if (err){
            return next(err);
        } 
        if (serie){
            req.serie = serie;
            next();
        } else{
            return res.status(404).send("The serie was not found");
        }
    })  
})

seriesRouter.use('/:seriesId/issues', issuesRouter)

seriesRouter.get('/', (req, res, next) =>{
    db.all("SELECT * FROM Series", (err, series) => {
        if(err){
            next(err);
            return res.sendStatus(500);
        } else{
            res.status(200).send({series: series});
        }

    })
});


const validateSerie = (req,res,next) => {
    const {name, description} = req.body.series;
    if (!name || !description){
        return res.status(400).send();
    }
    next();
}

seriesRouter.get('/:seriesId', (req,res,next)=>{
    res.send({series: req.serie});
})

seriesRouter.post('/', validateSerie, (req,res,next)=>{
    const {name, description} = req.body.series;
    db.run(`INSERT INTO Series (name, description) VALUES ($name, $description)`, 
        {
            $name: name,
            $description: description
        },
        function(error) {
            if (error){
                next(error);
                return res.status(500).send();
            }
            db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`, (err, serie) => {
                if (!serie) {
                    return res.sendStatus(500);
                }
                res.status(201).send({series: serie});
                });
        }
    )
})

seriesRouter.put('/:seriesId',validateSerie ,(req, res, next)=>{
    const {name, description} = req.body.series;
    db.run("UPDATE Series SET name=$name, description = $description WHERE id = $id", {
        $name : name,
        $description : description,
        $id : req.serie.id
    }, function(error){
        if (error){
            next(error);
            return res.status(500).send();
        }
        db.get(`SELECT * FROM Series WHERE id = ${req.serie.id}`, (err, serie) => {
            if (!serie) {
                return res.sendStatus(500);
            }
            res.status(200).send({series: serie});
            });
    })
})

module.exports = seriesRouter;