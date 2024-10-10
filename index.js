const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const {v4: uuidv4} = require('uuid');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded());

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const users = {};

app.get('/api/users', (req, res) => {
  let allUsers = [];
  Object.keys(users).forEach((key) => {
    allUsers.push({username: users[key].username, _id: users[key]._id});
  })
  res.json(allUsers);
})

app.post('/api/users', (req, res) => {
  let username = req.body.username;
  if(!isNaN(req.body.username)) {
    console.log(username);
    res.json({error: "No username provided"});
  }
  else {
    let uid = uuidv4();
    users[uid] = {"username": username, _id: uid, log: [], count: 0};
    res.json({"username": username, _id: uid});
  }
})

app.post('/api/users/:_id/exercises', (req, res) => {
  let uid = req.params._id;

  if(!uid || !users[uid]) {
    return res.json({error: "Invalid ID"});
  }

  let description = req.body.description;
  let duration = parseInt(req.body.duration);
  let date = new Date(req.body.date);

  console.log(date);

  if (!req.body.date) {
    date = new Date();
  }

  if(!description || !duration) {
    return res.json({error: "Invalid inputs"});
  }

  users[uid].log.push({description: description, duration: duration, date: date.toDateString()});
  users[uid].count++;
  res.json({
    _id: uid,
    username: users[uid].username,
    description: description,
    duration: duration,
    date: date.toDateString()
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  let uid = req.params._id;

  if(!uid || !users[uid]) {
    return res.json({error: "Invalid ID"});
  }

  let fromDate = new Date(req.query.from);
  let toDate = new Date(req.query.to);
  let limit = parseInt(req.query.limit);

  let currentUser = users[uid];

  if (!req.query.from && !req.query.to && !req.query.limit) {
    res.json(currentUser);
  }
  else {
    let filteredLogs = [];
    let i = 0;
    for (let index in currentUser.log) {
      let exercise = currentUser.log[index];
      if (req.query.limit && limit <= i) {
        break;
      }
      let exerciseDate = new Date(exercise.date);
      if (req.query.from && exerciseDate < fromDate) {
        continue;
      }
      if (req.query.to && exerciseDate > toDate) {
        continue;
      }
      filteredLogs.push(exercise);
      i++;

    }

    res.json({
      _id: currentUser._id,
      username: currentUser.username,
      count: filteredLogs.length,
      log: filteredLogs
    });
  }
  
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
