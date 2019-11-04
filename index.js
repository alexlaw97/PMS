const express = require('express')
const session = require('express-session')
const flash = require('express-flash-notification');
const cookieParser = require('cookie-parser');
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const axios = require('axios')
const app = express();
var ps =[];
var totsks = [];
var totaltasks = [];
var progresstasks = [];
const db = "mongodb+srv://admin:abc0123@cluster0-k1y0a.mongodb.net/pms?retryWrites=true&w=majority";

const PORT = process.env.PORT || 5000
// var mongo = require('mongodb').MongoClient;
// var objectId = require('mongodb').ObjectID;
    
// Mongodb connection
mongoose.connect(db,{ useNewUrlParser: true, useUnifiedTopology: true }).then(() => { 
  
  console.log('connected');
}).catch((er)=>{
  console.log(er);
})


//initialize function
app.use(session({secret: 'ssshhhhh', saveUninitialized: false, resave: false}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());

// Load Login Page
app.get('/',(req, res) => {
   res.render("pages/login");
  // res.render("pages/newemp");
});

// Project Manager Getting all employer data
app.get('/projmng' , loginSession, (req, res) => {
  var emp = require('./Empdb');
  var product = require('./prodDb');
  var add = require('./deaDb');
  emp.find({
    "Department" : "Production",
    "Position" : "Senior"
  })
  .then((response) => {
    emp.find({
      "Department" : "IT",
      "Position" : "Senior"
    })
    .then((response2) => {
      emp.find({
        "Department" : "Testing",
        "Position" : "Senior"
      })
      .then((response3) => {
        emp.find({
          "Department" : "Shipment",
          "Position" : "Senior"
        })
        .then((response4) => {
          emp.find({
            "Department" : "Mass",
            "Position" : "Senior"
          })
          .then((response5) => {
            emp.find({
              "Department" : "Quality Assurance",
              "Position" : "Senior"
            })
            .then((response6) => {
              add.find({})
            .then ((response7) => {
              product.find({})
              .then((response8) => {
                res.render("pages/createproj", {
                  productlist : response8,
                  prod : response,
                  it : response2,
                  test : response3,
                  ship : response4,
                  mass : response5,
                  quality :response6,
                  dealers : response7
                  })
                }) 
              })
            })
          })
        })
      })
    }) 
  })
});

//Insert new proj
app.post('/newproj' , (req, res) => {
  var insproj = require('./Projdb');
  var inspros = require('./prosdb');
  var insreq = require('./reqdb');
  var tasks = require('./taskdb');
  var emptask = [];
  var date = new Date();
  var projid;

  //Push all the selected employer id into a array
  emptask.push(req.body.selectedprod,req.body.selectedit,req.body.selectedtest,req.body.selectedmass,req.body.selectedquality,req.body.selectedship);


     // Calculation of total task and progression
     for(var x = 0; x < emptask.length; x++){
      
      tasks.findOne({
        "Task_id" : emptask[x]
      })
      .then((response3) => {
        var total = response3.Total_tasks;  
        var progress = response3.Progression;
        
        total++;
        progress++;
        if(totaltasks.length +1  > emptask.length ){
          totaltasks.length =0;
          progresstasks.length =0;
          totaltasks.push(total);
          progresstasks.push(progress);
        }
        else{
          totaltasks.push(total);
          progresstasks.push(progress);
        }
      })
    }

  insproj
  .find()
  .sort({"_id":-1})
  .limit(1)
  .then((response) => {
      projid = response[0].Project_id;
      projid++;
      proj = new insproj({
        Project_id : projid,
        Project_title: req.body.pid,
        Product_Id : req.body.selectedproduct,
        Deadline : req.body.date,
        Status : "Installation Phase",
        Pros_id : projid,
        Req_id : projid,
        Production : req.body.selectedprod,
        IT_Dept : req.body.selectedit,
        Testing_Dept : req.body.selectedtest,
        Mass_Dept : req.body.selectedmass,
        Quality_Dept : req.body.selectedquality,
        Ship_Dept : req.body.selectedship,
        Quantity : req.body.quantity,
        Dealer : req.body.mycustomer,
        Ins_start : date,
        Ins_end : "",
        //Soft_start: "",
        Soft_end: "",
        //mass_start: "",
        mass_end: "",
        //quality_start: "",
        quality_end: "",
        //testing_start: "",
        testing_end: "",
        //ship_start: "",
        ship_end: ""
      })
      //New process table
      pros = new inspros({
        Pros_id : projid,
        Ins_ps : "0",
        Soft_ps : "0",
        Test_ps : "0",
        Quality_ps: "0",
        Mass_ps : "0",
        Ship_ps : "0"
      })

      //New Requirement Table
      req = new insreq({
        Req_id : projid,
        Screen : "0",
        Battery : "0",
        Processor : "0",
        Camera : "0",
        Memory : "0",
        Inner_Body : "0",
        Vibrator : "0",
        Speaker : "0",
        Motherboard : "0",
        Button : "0"
      })

     
     
      // console.log(emptask.length);
      // var tsk = totaltasks[1];
      // console.log(tsk);
    // Update all the selected employers task number
      for(var x = 0; x < emptask.length; x++){
            tasks.updateOne({
              "Task_id" : emptask[x]
            },
          { $set:{
                  "Total_tasks" : totaltasks[x],
                  "Progression" : progresstasks[x]
                  
                  }
          },
          function(result){
            console.log("Update Successful");
          });
      }
    

      // Save new project into mongodb
      proj.save().then((result) => {
        //console.log(result);
        pros.save().then((result2) => {
          //console.log(result2);
          req.save().then((result3) => {
            //console.log(result3);
          })
        })
      })
    // res.redirect('/newproj');
    // res.redirect('/projmng');
    })
    .catch((error) => {
      console.log(error);
    })
    res.redirect('back');
  })

  // Employer chart diagram
  app.get('/employerchart',(req, res) => {
    var emp = require('./Empdb');
    var task = require('./taskdb');
    var persondept = req.session.department;
    var personname = req.session.name;
    var personid = req.session.pid;
    emp.find({
      "Department" : persondept
    })
    .then((response) => {
          task.find({})
          .then((response2) =>{
            res.render("pages/empchart",{
              data : response,
              data2 : response2,
              data3 : personid
            });
          })
        })
      });


//Main page of Employer Page (Nav Page)
app.get('/mainemp',(req, res) => {
  var personid = req.session.pid;
  var emp = require('./Empdb');
  emp.find({
    "Emp_id" : personid
  })
  .then((response) => {
    res.render("pages/mainemp",{
      employer : response
    });
  })
 
});

//View all project in list
app.get('/task',(req,res) => {
  var proj = require('./Projdb');
  var emp = require('./Empdb');
  proj.find()
  .then((response) => {
        emp.find().then((response2) => {
          res.render("pages/tasklist",{
            project : response,
            employerlist : response2
          });
        })
      })
    })

//View Self Task List
app.get('/mytask',(req,res) => {
  var persondept = req.session.department;
  var proj = require('./Projdb');
  var personid = req.session.pid;
  var date,date2;
  var datarray = [];

  if(persondept == "Production"){
    proj.find({
      "Production" : personid
    })
    .then((response) => {
      for(var x =0; x <response.length; x++){
      date2 = response[x].Deadline;
      date = new Date();
      let Difference = Math.abs(date2.getTime() - date.getTime());
      var different = Math.ceil(Difference / (1000 * 3600 * 24));
      datarray.push(different);
    } 
     
      res.render("pages/mytask",{
        project : response,
        duration : datarray
      });
    })
  }
  else if(persondept == "IT"){
    proj.find({
      "IT_Dept" : personid
    })
    .then((response) => {
      for(var x =0; x <response.length; x++){
        date2 = response[x].Deadline;
        date = new Date();
        let Difference = Math.abs(date2.getTime() - date.getTime());
        var different = Math.ceil(Difference / (1000 * 3600 * 24));
        datarray.push(different);
      } 
       
        res.render("pages/mytask",{
          project : response,
          duration : datarray
        });
    })
  }
  else if(persondept == "Testing"){
    proj.find({
      "Testing_Dept" : personid
    })
    .then((response) => {
      for(var x =0; x <response.length; x++){
        date2 = response[x].Deadline;
        date = new Date();
        let Difference = Math.abs(date2.getTime() - date.getTime());
        var different = Math.ceil(Difference / (1000 * 3600 * 24));
        datarray.push(different);
      } 
       
        res.render("pages/mytask",{
          project : response,
          duration : datarray
        });
    })
  }
  else if(persondept == "Mass"){
    proj.find({
      "Mass_Dept" : personid
    })
    .then((response) => {
      for(var x =0; x <response.length; x++){
        date2 = response[x].Deadline;
        date = new Date();
        let Difference = Math.abs(date2.getTime() - date.getTime());
        var different = Math.ceil(Difference / (1000 * 3600 * 24));
        datarray.push(different);
      } 
       
        res.render("pages/mytask",{
          project : response,
          duration : datarray
        });
    })
  }
  else if(persondept == "Quality Assurance"){
    proj.find({
      "Quality_Dept" : personid
    })
    .then((response) => {
      for(var x =0; x <response.length; x++){
        date2 = response[x].Deadline;
        date = new Date();
        let Difference = Math.abs(date2.getTime() - date.getTime());
        var different = Math.ceil(Difference / (1000 * 3600 * 24));
        datarray.push(different);
      } 
       
        res.render("pages/mytask",{
          project : response,
          duration : datarray
        });
    })
  }


})



// Load Employer  Page
app.get('/psen', loginSession, (req, res) => {
  var rq = require('./reqdb');
  var personid = req.session.pid;
  var persondept = req.session.department;
  var proj = require('./Projdb');
  var add = require('./deaDb');
  var projecid;
  var proj1 = [];
  var proj2 = [];
  proj.find({})
  .then((response) => {
    for(x=0;x<response.length;x++)
    {
      // console.log(personid);
      projecid = response[x].Project_id;
      if(x < 1)
      {  
        if(response[x].Status == "Installation Phase" && response[x].Production == personid)
        {
        proj1.push(projecid);
        }
        else if(response[x].Status == "Software Phase" && response[x].IT_Dept == personid)
        {
          proj1.push(projecid);
          }
          else if(response[x].Status == "Testing Phase" && response[x].Testing_Dept == personid)
          {
            proj1.push(projecid);
            }
            else if(response[x].Status == "Mass Phase" && response[x].Mass_Dept == personid)
            {
              proj1.push(projecid);
              }
              else if(response[x].Status == "Quality Phase" && response[x].Quality_Dept == personid)
              {
                proj1.push(projecid);
                }
                else if(response[x].Status == "Shipping Phase" && response[x].Ship_Dept == personid)
                {
                  proj1.push(projecid);
                  }
        // console.log("proj1 ",proj1);
      }
      else
      {
        if(response[x].Status == "Installation Phase" && response[x].Production == personid)
        {
        // console.log("proj2 ",proj2);
        proj2.push(projecid);
        Array.prototype.push.apply(proj1, proj2);
        }
        else if(response[x].Status == "Software Phase" && response[x].IT_Dept == personid)
        {
          proj2.push(projecid);
          Array.prototype.push.apply(proj1, proj2);
          }
          else if(response[x].Status == "Testing Phase" && response[x].Testing_Dept == personid) 
          {
            proj2.push(projecid);
            Array.prototype.push.apply(proj1, proj2);
            }
            else if(response[x].Status == "Mass Phase" && response[x].Mass_Dept == personid)
            {
              proj2.push(projecid);
              Array.prototype.push.apply(proj1, proj2);
              }
              else if(response[x].Status == "Quality Phase" && response[x].Quality_Dept == personid)
              {
                proj2.push(projecid);
                Array.prototype.push.apply(proj1, proj2);
                }
                else if(response[x].Status == "Shipping Phase" && response[x].Ship_Dept == personid)
                {
                  proj2.push(projecid);
                  Array.prototype.push.apply(proj1, proj2);
                  }
      }
      
    }
    if(persondept == "IT")
    {
      proj.find({
        "Project_id" :proj1
      })
      .then((response2) => {
        res.render("pages/software",{
          project : response2
          
        });
      })
    }
    else if(persondept == "Production")
    {
      rq.find({
        "Req_id" : proj1
      })
      .then((response2) => {
        console.log(response2);
        res.render("pages/employer",{
          requirement : response2,
        });
      })
    } 

    else if(persondept == "Testing")
    {
      proj.find({
        "Project_id" :proj1
      })
      .then((response2) => {
        res.render("pages/testing",{
          project : response2
        });
      })
    }

    else if(persondept == "Mass")
    {
      proj.find({
        "Project_id" :proj1
      })
      .then((response2) => {
        res.render("pages/software",{
          project : response2
        });
      })
    }
    
    else if(persondept == "Quality Assurance")
    {
      proj.find({
        "Project_id" :proj1
      })
      .then((response2) => {
        res.render("pages/quality",{
          project : response2
        });
      })
    }

    else if(persondept == "Shipment")
    {
      // console.log("asd");
      // res.render("pages/shipping");
      proj.find({
        "Project_id" :proj1
      })
      .then((response2) => {
          var deal =  [];
          for(var x = 0; x < response2.length; x++){
            deal.push(response2[x].Dealer);
          }
          add.find({
            "Name" : deal
          })
          .then((response3) => {
          
            res.render("pages/shipping",{
              project : response2,
              projdealer : response3
          })
        });
      })
    }
  })

  
});

// Load Project page
app.get('/pmng', loginSession, (req, res) => {
  var PJB = require('./Projdb');
  var EMP = require('./Empdb');
  var PSB = require('./prosdb');
  var total = [];

  var assign = [];
  var dept = req.session.department;
  PJB.find({})
  .then((response) => {
    console.log("Dept:",dept);
    for(x=0;x<response.length;x++){
        if(dept == "Production"){
          var assignid = response[x].Production;
        }
        else if(dept == "Mass")
        {
          var assignid = response[x].Mass_Dept;
        }
        else if(dept == "IT")
        {
          var assignid = response[x].IT_Dept;
        }
        else if(dept == "Testing")
        {
          var assignid = response[x].Testing_Dept;
        }
        else if(dept == "Shipment")
        {
          var assignid = response[x].Ship_Dept;
        }
     
      if(assignid != "")
      {
        if(x < 1)
        {  
          assign.push(assignid);
        }
        else
        {
        total.push(assignid);
        Array.prototype.push.apply(assign, total);
        }
        
      }
      //assign.push(assignid);
    }
  
        //console.log("Assign" , assign);
        EMP.find({
          "Emp_id": assign
        })
          .then((response2) => {
            
          res.render("pages/index", {
            project : response,
            employer : response2,
            phase : ps
          })
        })
        //   }
        // }
        
      })
    });


// Load Employer according to their department
app.get('/split', loginSession, (req, res) => {
  var worker = [];
  var workers = [];
  var sessiondep = req.session.department;
  var TDB = require('./taskdb');
  var EDB = require('./Empdb');
  EDB.find({
    "Department":req.session.department
  })
  .then((response) => {
    for(x=0;x<response.length ;x++){
      if(response[x].Emp_id == req.session.pid)
      {
        // console.log("duplicate");
        delete response[x];
      }
      else if (x<2){
        // console.log("continue");
        worker.push(response[x]);
      }
      else{
        workers.push(response[x]);
        Array.prototype.push.apply(worker, workers);
      }
    }
    TDB.find({

    })
    .then((response2) => {
      res.render("pages/splitwork", {
        empl : worker,
        tsk : response2
    })
  })
  //console.log("All Response: ",response);
  //console.log("All Workers: ",workers);
   
  })
});



  //Login User
   app.post('/login', (req,res) => {
     ps.length = 0;
     var user = require('./userDb');
     var emp = require('./Empdb')
     var username = req.body.username;
     var password = req.body.password;
     var emp_id;
     user.find({
       "Username":username,
       "Password":password
     })
     .then((response) => {
       emp_id = response[0].Emp_id;
       req.session.pid = emp_id;
       console.log("ID: ",req.session.pid)
       req.session.name = response[0].Name;
       emp.find({
         "Emp_id": emp_id
       })
       .then((response1) =>{
          if(response1[0].Department == "Project_Management" && response1[0].Position == "Manager"){
            req.session.position = response1[0].Position;
            req.session.department = response1[0].Department;
            res.redirect('/projmng');
          }
          else if(response1[0].Position == "Manager"){
            req.session.position = response1[0].Position;
            req.session.department = response1[0].Department;
            console.log(response1[0].Department);
            countphase();
            res.redirect('/pmng');
          }
          else {
            req.session.position = response1[0].Position;
            req.session.department = response1[0].Department;
            res.redirect('/mainemp');
        }
       })
       
       
      })
      .catch((error) => {
        console.log('user not found');
        res.redirect('/');
        return false;
    })   
   })

//Post Product
// app.post('/product', (req, res) => {
//   var input = req.body.prod;
 
// })

// Load split work page
// app.get('/split', (req, res) => {
//   res.render("pages/splitwork");
// });

// Assigned employer id into Project Collection
app.post('/update/id' ,(req, res) => {
  console.log('Update');
  var emp_id = req.body.selected;
  var proj = require('./Projdb');
  proj.updateOne({
    "Project_id":req.body.id
  },
  {
    $set:{
    "Emp_id" : emp_id,
    "Status" : "Progressing"
    }
  },
  function(result){
    res.redirect("./pmng")
  });
})

// Update Progress in Requirement Table
app.post('/Req',(req, res) => {
  var req_tbl = require('./reqdb');
  var proj_tbl = require('./Projdb');
  var pros_tbl = require('./prosdb');
  var task_tbl = require('./taskdb');
  var date = new Date();
  date.setHours(date.getHours() + 8);
  var personid = req.session.pid;
  var part = req.body.parts;
  var id = req.body.reqid;
  console.log(id);
  console.log(part);
  // req_tbl.updateOne({
  //   "Req_id" : "8"
  // },
  // {
  //   "Screen" : "1"
  // });
  switch(part){
    case "Screen":
        req_tbl.updateOne({
          "Req_id": id
        },
        {
          $set:{
          "Screen" : "1"
          }
        },
        function(result){
          console.log("Update Successful");
          
        });
          break;

    case "Battery":
        req_tbl.updateOne({
          "Req_id": id
        },
        {
          $set:{
          "Battery" : "1"
          }
        },
        function(result){
          console.log("Update Successful");
        });
        break;

    case "Processor":
        req_tbl.updateOne({
          "Req_id": id
        },
        {
          $set:{
          "Processor" : "1"
          }
        },
        function(result){
          console.log("Update Successful");
        });
        break;

    case "camera":
        req_tbl.updateOne({
          "Req_id": id
        },
        {
          $set:{
          "Camera" : "1"
          }
        },
        function(result){
          console.log("Update Successful");
        });
        break;

    case "memory":
        req_tbl.updateOne({
          "Req_id": id
        },
        {
          $set:{
          "Memory" : "1"
          }
        },
        function(result){
          console.log("Update Successful");
        });
        break;

    case "inner_body":
        req_tbl.updateOne({
          "Req_id": id
        },
        {
          $set:{
          "Inner_Body" : "1"
          }
        },
        function(result){
          console.log("Update Successful");
        });
        break;

    case "vibrator":
        req_tbl.updateOne({
          "Req_id": id
        },
        {
          $set:{
          "Vibrator" : "1"
          }
        },
        function(result){
          console.log("Update Successful");
        });
        break;

    case "speaker":
          req_tbl.updateOne({
            "Req_id": id
          },
          {
            $set:{
            "Speaker" : "1"
            }
          },
          function(result){
            console.log("Update Successful");
          });
          break;

    case "motherboard":
          req_tbl.updateOne({
            "Req_id": id
          },
          {
            $set:{
            "Motherboard" : "1"
            }
          },
          function(result){
            console.log("Update Successful");
          });
          break;

    case "button":
          req_tbl.updateOne({
            "Req_id": id
          },
          {
            $set:{
            "Button" : "1"
            }
          },
          function(result){
            proj_tbl.updateOne({
                "Project_id": id
                },
                  {
            $set:{
            "Status" : "Software Phase",
            "Ins_end" : date
            }
          },
            function(result2){
            })
              pros_tbl.updateOne({
                "Pros_id": id
              },
                {
                  $set:{
                    "Ins_ps" : "1"
                    }
                      },
                    function(result){
                      task_tbl.find({
                        "Task_id" : personid
                      })
                      .then((response) => {
                        var comp = response.Complete_tasks;
                        var prog = response.Progression;
                        comp++;
                        prog--;
                        task_tbl.updateOne({
                          "Task_id" : personid
                        },
                        {
                          $set:{
                            "Complete_tasks" : comp,
                            "Progression" : prog
                          }
                        },
                        function(result3){
                          res.send("<script>alert('Update Successful')</script>");
                        })
                      })
                    })
                    });
          break;
  }

  res.redirect('back');

  // function(result){
  //   console.log(result);
  //   res.redirect('/psen');
  // })
  // .then((response) =>{
  //   console.log(response);
  // }).catch((error) => {
  //   console.log(error);
  // })
  // function update(){
  //   req_tbl.updateOne({
  //     "Req_id": id
  //   },
  //   {
  //     $set:{
  //     part : "1"
  //     }
  //   },
  // }
});

//Update Status Software / Mass Production
app.post('/status' , (req, res) => {
  var proj_tbl = require('./Projdb');
  var pros_tbl = require('./prosdb');
  var prod_tbl = require('./prodDb');
  var dev_tbl = require('./devdb');
  var projid = req.body.projectid;
  var persondept = req.session.department;
  var date = new Date();
  var id = req.session.pid;
  var dept = req.session.department;
  var rez = req.body.res;
  var random;
  if(persondept == "IT"){
      proj_tbl.updateOne({
        "Project_id": projid
      },
      {
        $set:{
        "Status" : "Testing Phase",
        "Soft_end" : date
        }
      },
      function(result){
        pros_tbl.updateOne({
          "Pros_id": projid
        },
        {
          $set:{
          "Soft_ps" : "1"
          }
        },
        function(result){
          console.log("Update Successful");
          
          
        });
      });
    }

    //Testing phase yes == true and else no will be back to installation phase
    else if(persondept == "Testing")
    {
    if(rez == "yes")
    {
      proj_tbl.updateOne({
        "Project_id": projid
      },
      {
        $set:{
        "Status" : "Mass Phase",
        "testing_end" : date
        }
      },
      function(result){
        pros_tbl.updateOne({
          "Pros_id": projid
        },
        {
          $set:{
          "Test_ps" : "1"
          }
        },
        function(result){
          console.log("Update Successful");
        });
      });
    }
    else
    {
      proj_tbl.updateOne({
        "Project_id": projid
      },
      {
        $set:{
        "Status" : "Installation Phase",
        }
      },
      function(result){
        pros_tbl.updateOne({
          "Pros_id": projid
        },
        {
          $set:{
          "Soft_ps" : "0",
          "Ins_ps" : "0"
          }
        },
        function(result){
          console.log("Update Successful");
        });
      });
    }
    }
    else if(persondept == "Mass")
    {
      proj_tbl.updateOne({
        "Project_id": projid
      },
      {
        $set:{
        "Status" : "Quality Phase",
        "mass_end" : date
        }
      },
      function(result){
        pros_tbl.updateOne({
          "Pros_id": projid
        },
        {
          $set:{
          "Mass_prod" : "1"
          }
        },
        function(result){
          console.log("Update Successful");
        });
      });
    }
    else if(persondept == "Quality Assurance")
    {
      if(rez == "yes")
      {
        proj_tbl.updateOne({
          "Project_id": projid
        },
        {
          $set:{
          "Status" : "Shipping Phase",
          "quality_end" : date
          }
        },
        function(result){
          pros_tbl.updateOne({
            "Pros_id": projid
          },
          {
            $set:{
            "Quality_ps" : "1"
            }
          },
          function(result){
            proj_tbl
            .find({
              "Project_id" : projid
            })
            .then((response) => { 
              var Prod_id = response[0].Product_Id;
              var number = response[0].Quantity;
              prod_tbl.find({
                "Product_id" : Prod_id
              })
              .then((response2) => {
                var prod_name = response2[0].Product_name;
                for(var i = 0; i < number; i++){
                  x++;
                  dev_tbl
                  .find()
                  .sort({"_id":-1})
                  .limit(1)
                  .then((response3) => {
                    dev = response3[0].Device_id;
                    dev++;
                    device = new dev_tbl({
                      Device_id : dev,
                      Manufacture : date,
                      Status : "Delivery",
                      Product_name : prod_name,
                      Serial_number : generateSerial()
                    })
                    device.save().then((result) => {
                      console.log("Insert Successful");
                    })
                  })
                  .catch((error) => {
                    console.log(error);
                  })
                } 
            })
          });
        })
        });
      }
      else
      {
        proj_tbl.updateOne({
          "Project_id": projid
        },
        {
          $set:{
          "Status" : "Installation Phase",
          }
        },
        function(result){
          pros_tbl.updateOne({
            "Pros_id": projid
          },
          {
            $set:{
            "Soft_ps" : "0",
            "Ins_ps" : "0"
            }
          },
          function(result){
            console.log("Update Successful");
          });
        });
      }
    }
  res.redirect('back');
})

//Insert new Employer
app.post('/newemp' , (req, res) => {
  var insemp = require('./Empdb');
  var insuser = require('./userDb');
  var instask = require('./taskdb');
  var empid;
  insemp
  .find()
  .sort({"_id":-1})
  .limit(1)
  .then((response) => {
    empid = response[0].Emp_id;
    empid++;
    emp = new insemp({
      Emp_id : empid,
      Emp_name : req.body.name,
      Department : req.body.dept,
      Position : req.body.pos,
      Emp_ic : req.body.ic,
      Task_id : empid
    })

    //New Login data
    user = new insuser({
     Name : req.body.name,
     Username : req.body.username,
     Password : req.body.password,
     Emp_id : empid
    })

    //New Task data
    task = new instask({
      Task_id : empid,
      Total_tasks : "0",
      Complete_tasks : "0",
      Progression : "0"
    })

    //Save new project into mongodb
    emp.save().then((result) => {
      //console.log(result);
      user.save().then((result2) => {
        //console.log(result2);
        task.save().then((result3) => {
          //console.log(result3);
        })
      })
    })
  res.redirect('/newemp',{
    success : "1"
  });
  })
  .catch((error) => {
    console.log(error);
  })
  return false;
})

app.post('/comparedate' , (req, res) => {
  var proj_tbl = require('./Projdb');
  var projectid = req.body.id;
  var avgtime = [];
  proj_tbl.find({})
  .then((response) => {
    var count, totalinsert, totalsof, totaltest, totalmas, totalquality, averageinsert, averagesoftware, averagequality, averagemass, averagetesting;
    count = totalinsert = totalsof = totaltest = totalmas = totalquality = averageinsert = averagesoftware = averagemass = averagetesting = averagequality = 0;
    for(var x = 0; x < response.length; x++){
      insert1 = response[x].Ins_start;
      insert2 = response[x].Ins_end;
      if(insert1 == "" || insert2 == ""){
      }
      else{
        let insDifference = Math.abs(insert2.getTime() - insert1.getTime());
        var differentins = Math.ceil(insDifference / (1000 * 3600 * 24));
        totalinsert += differentins;
      }

      soft = response[x].Soft_end;
      if(soft == "" || insert2 == ""){
      }
      else{
        let sofDifference = Math.abs(soft.getTime() - insert2.getTime());
        var differentsof = Math.ceil(sofDifference / (1000 * 3600 * 24));
        totalsof += differentsof;
    }

      test = response[x].testing_end;
      if(test == "" || soft == ""){
      }
      else{
        let testDifference = Math.abs(test.getTime() - soft.getTime());
        var differenttest = Math.ceil(testDifference / (1000 * 3600 * 24));
        totaltest += differenttest;
      }

      mass = response[x].mass_end;
      if(test == "" || mass == ""){
      }
      else{
        let masDifference = Math.abs(mass.getTime() - test.getTime());
        var differentmas = Math.ceil(masDifference / (1000 * 3600 * 24));
        totalmas += differentmas;  
    }

      quality = response[x].quality_end;
      if(quality == "" || mass == ""){
      }
      else{
      let qualityDifference = Math.abs(quality.getTime() - mass.getTime());
      var differentquality = Math.ceil(qualityDifference / (1000 * 3600 * 24));
      totalquality += differentquality;
      }
      count++;
    }
    averageinsert = totalinsert/ count; 
    averagesoftware = totalsof/ count; 
    averagetesting = totaltest/ count; 
    averagemass = totalmas/ count;
    averagequality = totalquality/ count; 
    avgtime.push(averageinsert,averagesoftware,averagetesting,averagemass,averagequality);
    proj_tbl.find({
      "Project_id" : projectid
    })
      .then((response2) => {
        var projduration = [];
        for(var x = 0; x < response2.length; x++){
          curins = response2[x].Ins_start;
          curins2 = response2[x].Ins_end;
          if(curins == "" ||  curins2 == ""){
            differentins = 0;
          }
          else{
          let insDifference = Math.abs(curins2.getTime() - curins.getTime());
          let differentins = Math.ceil(insDifference / (1000 * 3600 * 24));
          }

          cursoft = response2[x].Soft_end;
          if(curins2 == "" || cursoft == ""){
            differentsof = 0;
          }
          else{
          let sofDifference = Math.abs(cursoft.getTime() - curins2.getTime());
          let differentsof = Math.ceil(sofDifference / (1000 * 3600 * 24));
          }

          curtest = response2[x].testing_end;
          if(curtest == "" || cursoft == ""){
            differenttest = 0;
          }
          else{
          let testDifference = Math.abs(curtest.getTime() - cursoft.getTime());
          let differenttest = Math.ceil(testDifference / (1000 * 3600 * 24));
          }

          curmas = response2[x].mass_end;
          if(curmas == "" || curtest == ""){
            differentmas = 0;
          }
          else{
          let masDifference = Math.abs(curmas.getTime() - curtest.getTime());
          let differentmas = Math.ceil(masDifference / (1000 * 3600 * 24));
          }

          curquality = response2[x].quality_end;
          if(curquality == "" || curmas == ""){
            differentquality = 0;
          }
          else{
          let qualityDifference = Math.abs(curquality.getTime() - curmas.getTime());
          let differentquality = Math.ceil(qualityDifference / (1000 * 3600 * 24));
          }
          
          projduration.push(differentins,differentsof,differenttest,differentmas,differentquality);
        }
        res.render("pages/chart", {
          average : avgtime,
          current : projduration
        });
      })
})
})

// Redirect to home page
app.get('/logout', (req, res) => {
  req.session.destroy();    // Destroy session before redirect
  console.log('session destroy');
  res.redirect("/");
});

app.listen(PORT, () =>{
  console.log(`Listening on ${ PORT }`)
});

// Function for checking session
function loginSession(req, res, next) {
  var sessionName = req.session.name;
  var sessionid = req.session.pid;
  var sessionposition = req.session.position;
  var sessiondep = req.session.department;
  if(!sessionName || !sessionposition || !sessiondep || !sessionid ){
      res.redirect('/');  // Redirect back to login
      console.log('session invalid');
  }
  else {
      console.log('session valid');
      next(); // Continue to next step
  }
};

function generateSerial() {
    
  'use strict';
  
  var chars = '1234567890',
      
      serialLength = 15,
      
      randomSerial = "",
      
      i,
      
      randomNumber;
  
  for (i = 0; i < serialLength; i = i + 1) {
      
      randomNumber = Math.floor(Math.random() * chars.length);
      
      randomSerial += chars.substring(randomNumber, randomNumber + 1);
      
  }
  
  return randomSerial;
  
}

function countphase(){
  var PJB = require('./Projdb');
  var PSB = require('./prosdb');
  var one = [];
  PJB.find()
    .then((response5) =>{
      for(var z = 0; z < response5.length; z++){
         var q = response5[z].Project_id;
         one.push(q);
        }
  
        PSB.find({
        "Pros_id" : one
        })
        
        .then((response3) => { 
            var w = 0;
            while(response3[w] != null){
              var quality = response3[w].Quality_ps;
              var mass = response3[w].Mass_ps;
              var test = response3[w].Test_ps;
              var soft = response3[w].Soft_ps;
              var ins = response3[w].Ins_ps;
                if(quality == "1"){
                  ps.push("5");
                  w++;
                }
                else if(mass == "1"){
                  ps.push("4");
                  w++;
                }
                else if(test == "1"){
                  ps.push("3");
                  w++;
                }
                else if(soft == "1"){
                  ps.push("2");
                  w++;
                }
                else if(ins == "1"){
                  ps.push("1");
                  w++;
                }
                else {
                  ps.push("0");
                  w++;
                }
            }
          })
        }) 
      }
  function duration(){

    return different;
   
  }

