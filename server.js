const express = require('express');
const mongoose = require('mongoose');
const defination = require('./models/Defination');
const definationInstance = require('./models/DefinationInstance');
const User  = require('./models/User');
const workflow = require('./core/Instance');

var admin = require("firebase-admin");

var serviceAccount = require("./firebase.json");

const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const app = express();
var bodyParser = require('body-parser')
app.use(bodyParser.json());

let connectionString = 'mongodb+srv://root:Punit%40123@cluster0.iv669.mongodb.net/test?retryWrites=true&w=majority'

mongoose.connect(connectionString);

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// Authentication Middleware - This will check if the token is valid
app.use(function (req, res, next) {
  firebase.auth()
  .verifyIdToken(req.headers.authorization)
  .then((decodedToken) => {
    const uid = decodedToken.uid;
    req.body.userId = uid;
    User.findOneAndUpdate({uid : uid}, { $set: { uid: uid, userProfile : {}, userType : req.query.type }}, { upsert: true  }).then(user => {
      req.body.user = user;
      next()
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({  message: 'Internal Server Error' });
    });

  })
  .catch((error) => {
    // Handle error
    res.status(401).send({  message: 'Unauthorized' });
  });
  
})

app.listen(3001, function() {
    console.log('listening on 3001');
  })

app.get('/create_demo', (req, res) => {
  defination.create({
    "name": "TEST",
    "steps" : {
      "START_STEP": {
          "step": "0",
          "next": "ptaUpdate"
        },
      "ptaUpdate": {
          "step": "1",
          "actors" : ["FACULTY"],
          "next": "collectReport"
        },
        "collectReport": {
          "step": "2",
          "actors" : ["ADMIN"],
          "next": "END_STEP"
        }
  },
  "watchers" : ["STUDENT", "FACULTY", "ADMIN"],
  "creators" : ["ADMIN"],

  }).then((ans) => {
    console.log("Document inserted")
    res.send('Document inserted')
  }).catch((err) => {
    console.log(err.Message);
  })
})

app.get('/create_instance', (req, res) => {
  defination.findOne({name: 'TEST'}).then((defn) => {
    workflow.initialize(defn).then((ans) => {
      res.send(JSON.stringify(ans))
    }).catch((err) => {
      res.send(JSON.stringify(err))
    });
    //resolve(ans);
    }).catch((err) => {
      res.send(JSON.stringify(err))
   // reject(err);
    })
})

app.get('/get_instance', (req, res) => {
  workflow.getInstance(req.query.instanceId).then((ans) => {
    res.send(JSON.stringify(ans))
  }).catch((err) => {
    res.send(JSON.stringify(err))
  });
})

app.post('/execute_instance', (req, res) => {
  
  workflow.execute(req.query.instanceId, req.body.data, req.body.user).then((executedWorkflow) => {
    res.send(JSON.stringify(executedWorkflow))
  }).catch((err) => {
    res.send(JSON.stringify(err))
  });
})


app.get('/user', (req, res) => {
  res.send(req.body.user)
})