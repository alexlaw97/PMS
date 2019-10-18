var mongoose = require('mongoose');
var quaSchema = new mongoose.Schema({
    quality_id: String,
    Device_id: String,
    Status: String,
    
})

var qua = mongoose.model('qua', quaSchema, 'Quality');
module.exports = qua;
