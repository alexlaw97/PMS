var mongoose = require('mongoose');
var prosSchema = new mongoose.Schema({
    Pros_id: String,
    Ins_ps: String,
    Soft_ps: String,
    Test_ps: String,
    Quality_ps: String,
    Mass_prod: String,
    Ship_ps: String
})

var pros = mongoose.model('pros',prosSchema,'Process');
module.exports = pros;