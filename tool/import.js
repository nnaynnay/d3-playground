let fs = require('fs');
let xml2js = require('xml2js');
let _ = require('lodash');
let mongoose = require('mongoose');

const DB_CONN = 'mongodb://localhost:27017/gov';
mongoose.connect(DB_CONN, { useNewUrlParser: true });

let importFiles = ['../data/bnb-u.xml', '../data/bnb-nt.xml'];

// Schema
const Building = require('../models/building');

// Import and parse xml data.
let parser = new xml2js.Parser();
importFiles.forEach(file => {
    fs.readFile(file, (err, data) => {
        parser.parseString(data, (err, result) => {
            const records = _.get(result, 'data-set.Record');
            records.forEach(record => {
                let aBuilding = new Building({
                    source: record,
                    EnglishBuildingName: [
                        record.EnglishBuildingName1[0],
                        record.EnglishBuildingName2[0],
                        record.EnglishBuildingName3[0]
                    ],
                    ChineseBuildingName: [
                        record.ChineseBuildingName1[0],
                        record.ChineseBuildingName2[0],
                        record.ChineseBuildingName3[0]
                    ],
                    EnglishAddress: [
                        record.EnglishAddress1[0],
                        record.EnglishAddress2[0],
                        record.EnglishAddress3[0]
                    ],
                    ChineseAddress: [
                        record.ChineseAddress1[0],
                        record.ChineseAddress2[0],
                        record.ChineseAddress3[0]
                    ],
                    OwnersCorporation: record.OwnersCorporation[0],
                    EnglishPublicHousingType: record.EnglishPublicHousingType[0],
                    ChinesePublicHousingType: record.ChinesePublicHousingType[0]
                });
                const year = parseInt(record.YearBuild[0]);
                if (!isNaN(year)) {
                    aBuilding.YearBuild = year;
                }
                aBuilding.save(err => {
                    if (err) {
                        console.error(err);
                    }
                    console.log('Created ', aBuilding.EnglishBuildingName.join(' '));
                });
            });
            console.log('Done');
        });
    });
});
