var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
    Name: String,
    Username: String,
    Password: String,
    Emp_id: String
})

var user = mongoose.model('user',userSchema,'Login');
module.exports = user;