const mongoose = require('mongoose');

const BuildingSchema = new mongoose.Schema({
    source: {
        EnglishBuildingName1: [String],
        ChineseBuildingName1: [String],
        EnglishBuildingName2: [String],
        ChineseBuildingName2: [String],
        EnglishBuildingName3: [String],
        ChineseBuildingName3: [String],
        EnglishAddress1: [String],
        ChineseAddress1: [String],
        EnglishAddress2: [String],
        ChineseAddress2: [String],
        EnglishAddress3: [String],
        ChineseAddress3: [String],
        YearBuild: [String],
        OwnersCorporation: [String],
        EnglishPublicHousingType: [String],
        ChinesePublicHousingType: [String]
    },
    EnglishBuildingName: [String],
    ChineseBuildingName: [String],
    EnglishAddress: [String],
    ChineseAddress: [String],
    YearBuild: Number,
    OwnersCorporation: String,
    EnglishPublicHousingType: String,
    ChinesePublicHousingType: String
});
BuildingSchema.index({ EnglishBuildingName: 1 }, { unique: true });

module.exports = mongoose.model('Building', BuildingSchema);