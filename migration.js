const sqlite = require('sqlite3');

const db = new sqlite.Database('./database.sqlite');

db.serialize(()=> {
    db.run(`DROP TABLE IF EXISTS Artist`);
    db.run(`CREATE TABLE Artist (id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        date_of_birth TEXT NOT NULL,
        biography TEXT NOT NULL,
        is_currently_employed INTEGER DEFAULT 1)`);

    db.run(`DROP TABLE IF EXISTS Series`);
    db.run(`CREATE TABLE Series (id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL)`);

    db.run(`DROP TABLE IF EXISTS Issue`);
    db.run(`CREATE TABLE Issue (id INTEGER NOT NULL,
        name TEXT NOT NULL,
        issue_number INTEGER NOT NULL,
        publication_date TEXT NOT NULL,
        artist_id INTEGER NOT NULL,
        series_id INTEGER NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (artist_id) REFERENCES Artist(id),
        FOREIGN KEY (series_id) REFERENCES Series(id))`);

});
