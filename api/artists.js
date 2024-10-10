const express = require('express');
const sqlite = require('sqlite3');

const db = new sqlite.Database(process.env.TEST_DATABASE || '../database.sqlite');
const artistsRouter = express.Router();

artistsRouter.get('/', (req, res, next) =>{
    db.all("SELECT * FROM Artist WHERE is_currently_employed = 1", (err, artists) => {
        if(err){
            console.log("Something wrong when trying to return artists");
            console.log(err);
            return res.sendStatus(500);
        } else{
            res.status(200).send({artists: artists});
        }

    })
});


artistsRouter.param('artistId', (req, res, next, id) =>{
    db.get("SELECT * FROM Artist WHERE id = $id", {$id:id}, (err, artist) =>{
        if (err){
            return next(err);
        } 
        if (artist){
            req.artist = artist;
            next();
        } else{
            return res.status(404).send("The artist was not found");
        }
    })
});

const validateArtist = (req, res, next) => {
    const {name, dateOfBirth, biography} = req.body.artist;
    if (!name || !dateOfBirth || !biography){
        return res.status(400).send();
    }
    next();
}

artistsRouter.get('/:artistId', (req, res, next) => {
    res.send({artist: req.artist});
});

artistsRouter.put('/:artistId', validateArtist, (req, res, next) => {
    const {name, dateOfBirth, biography} = req.body.artist;
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1 ;
    db.run(`UPDATE Artist SET name = $name,
         date_of_birth = $dateOfBirth, 
         biography = $biography, 
         is_currently_employed=$isCurrentlyEmployed 
         WHERE id = $id`, {
            $name : name,
            $dateOfBirth : dateOfBirth,
            $biography : biography,
            $isCurrentlyEmployed  : isCurrentlyEmployed,
            $id: req.artist.id
        }, function(error) {
            if (error){
                next(error);
                return res.status(500).send();
            }
            db.get(`SELECT * FROM Artist WHERE id = ${req.artist.id}`, (err, artist) => {
                if (!artist) {
                    return res.sendStatus(500);
                }
                res.status(200).send({artist: artist});
                });
        })
});

artistsRouter.delete('/:artistId', (req, res, next) =>{
    db.run(`UPDATE Artist SET is_currently_employed = 0 WHERE id=$id`,
        {
            $id: req.artist.id
        }, function(error) {
            if (error){
                next(error);
                return res.status(500).send();
            }
                       db.get(`SELECT * FROM Artist WHERE id = ${req.artist.id}`, (err, artist) => {
                if (!artist) {
                    return res.sendStatus(500);
                }
                res.status(200).send({artist: artist});
                });
        }
    )
})

artistsRouter.post('/', validateArtist, (req, res, next) => {
    const {name, dateOfBirth, biography} = req.body.artist;
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1 ;

    db.run(`INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) 
        VALUES ($name, $date_of_birth, $biography, $is_currently_employed)`,
        {$name: name, $date_of_birth: dateOfBirth, $biography: biography, $is_currently_employed:isCurrentlyEmployed}, 
    function(error) {
        if (error){
            next(error);
            return res.status(500).send();
        }
        db.get(`SELECT * FROM Artist WHERE id = ${this.lastID}`, (err, artist) => {
            if (!artist) {
                return res.sendStatus(500);
            }
            res.status(201).send({artist: artist});
            });
    })
});

module.exports = artistsRouter;