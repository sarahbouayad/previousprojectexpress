// did this along with Ellie, Hassan, Jasmine, and the cohort that was present.

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;

var db, collection;

const url =
  "mongodb+srv://new-user:FYySNVUCpPPPGNRd@cluster0.jrxcjiu.mongodb.net/coinFlip?retryWrites=true&w=majority";
const dbName = "coinFlip";

// password: FYySNVUCpPPPGNRd

app.listen(3000, () => {
  MongoClient.connect(
    url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (error, client) => {
      if (error) {
        throw error;
      }
      db = client.db(dbName);
      console.log("Connected to `" + dbName + "`!");
    }
  );
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  db.collection("results")
    .find()
    .toArray((err, allDocuments) => {
      if (err) return console.log(err);
      res.render("index.ejs", { coinFlipResults: allDocuments });
    });
});

app.post("/results", (req, res) => {
  // coinflip logic

  let coinResult = Math.ceil(Math.random() * 2);
  let botResult;
  let userInput = req.body.userGuess.toLowerCase()
if(userInput === "heads" || userInput === "tails"){
  if (coinResult <= 1) {
    botResult = "heads";
  } else if (coinResult <= 2) {
    botResult = "tails";
  }

  let outcome;

  if (botResult === req.body.userGuess) {
    outcome = "You Win!";
  } else {
    outcome = "You Lose!";
  } 
  db.collection("results").insertOne(
    {
      userGuess: req.body.userGuess,
      coinFlipResults: botResult,
      winOrLose: outcome,
    },
    (err, result) => {
      if (err) return console.log(err);
      console.log("saved to database");
      res.redirect("/");
    }
  );
}
// }else{
//   return showAlert("Error 404: Not A Flip!")
// }
});

app.put("/messages", (req, res) => {
  db.collection("results").findOneAndUpdate(
    {name: req.body.name, msg: req.body.msg},
    {
      $set: {
        thumbUp: req.body.thumbUp + 1,
      },
    },
    {
      sort: { _id: -1 },
      upsert: true,
    },
    (err, result) => {
      if (err) return res.send(err);
      res.send(result);
    }
  );
});

app.delete("/messages", (req, res) => {
  db.collection("results").findOneAndDelete(
    {name: req.body.name, msg: req.body.msg},
    (err, result) => {
      if (err) return res.send(500, err);
      res.send("Message deleted!");
    }
  );
});
