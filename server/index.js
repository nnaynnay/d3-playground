const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');

const DB_CONN = 'mongodb://127.0.0.1:27017/gov';
mongoose.connect(DB_CONN, { keepAlive: true, useNewUrlParser: true });

app.get('/buildings', (req, res) => {
    const Building = require('./models/building');
    Building.find(
        {},
        'EnglishBuildingName YearBuild OwnersCorporation EnglishPublicHousingType',
        (err, result) => {
            if (err) {
                console.error(err);
                res.end();
            }
            res.json(result);
        });
});

mongoose.connection
    .on('error', console.error)
    .once('open', () => {
        app.listen(port, () => console.log(`Listening on port ${port}!`));
    });