require('dotenv').config()
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
// const mongoose = require('mongoose');
const rp = require('request-promise');
const QUANDL_API_KEY = process.env.QUANDL_API_KEY;


// const DB_CONN = 'mongodb://127.0.0.1:27017/gov';
// mongoose.connect(DB_CONN, { keepAlive: true, useNewUrlParser: true });

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

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

app.get('/pricing', (req, res) => {
    const options = {
        uri: `https://www.quandl.com/api/v3/datasets/EOD/MSFT?start_date=2017-10-10&end_date=2018-10-12&api_key=${QUANDL_API_KEY}`,
        json: true
    };
    rp(options).then(results => {
        if (!results.dataset || !results.dataset.data) {
            console.log('No data');
            res.end();
        }
        const findColIdx = (key) => { return results.dataset.column_names.findIndex(n => n === key); }
        // const closeColIdx = findColIdx('Close');
        const highColIdx = findColIdx('High');
        const lowColIdx = findColIdx('Low');
        // res.send(results.dataset.data.map(d => [d[closeColIdx]]));
        res.send(results.dataset.data.map(d => [d[lowColIdx], d[highColIdx]]));
    });
});

app.get('/pricing/relative', (req, res) => {
    const options = {
        uri: `https://www.quandl.com/api/v3/datasets/EOD/MSFT?start_date=2017-10-10&end_date=2018-10-12&transform=rdiff&api_key=${QUANDL_API_KEY}`,
        json: true
    };
    rp(options).then(results => {
        if (!results.dataset || !results.dataset.data) {
            console.log('No data');
            res.end();
        }
        const findColIdx = (key) => { return results.dataset.column_names.findIndex(n => n === key); }
        // const closeColIdx = findColIdx('Close');
        const highColIdx = findColIdx('High');
        const lowColIdx = findColIdx('Low');
        // res.send(results.dataset.data.map(d => [d[closeColIdx]]));
        res.send(results.dataset.data.map(d => [d[lowColIdx], d[highColIdx]]));
    });
});

app.get('/pricing/hk', (req, res) => {
    const code = req.query.code || '83079';
    const relative = req.query.relative || '83079';
    const start_date = req.query.start_date || '2017-01-01';
    const end_date = req.query.end_date || '2019-01-01';
    const options = {
        uri: `https://www.quandl.com/api/v3/datasets/HKEX/${code}?start_date=${start_date}&end_date=${end_date}&api_key=${QUANDL_API_KEY}`,
        json: true
    };
    rp(options).then(results => {
        if (!results.dataset || !results.dataset.data) {
            console.log('No data');
            res.end();
        }
        res.send(results.dataset);
    });
});

app.use(express.static('public'));

app.listen(port, () => console.log(`Listening on port ${port}!`));

// mongoose.connection
//     .on('error', console.error)
//     .once('open', () => {
//         app.listen(port, () => console.log(`Listening on port ${port}!`));
//     });