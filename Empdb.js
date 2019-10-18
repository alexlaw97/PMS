var mongoose = require('mongoose');
var EmpSchema = new mongoose.Schema({
    Emp_id: String,
    Emp_name: String,
    Department: String,
    Position: String,
    Emp_ic: String
})

var emp = mongoose.model('emp',EmpSchema,'Employer');
module.exports = emp;