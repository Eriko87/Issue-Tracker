/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb')
const ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DATABASE; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});



module.exports = function (app) {

  app.route('/api/issues/:project')
    .get(function (req, res){
    var project = req.params.project;
      
      MongoClient.connect(CONNECTION_STRING, function(err, client) {
        var db = client.db("project");
        db.collection("project").find({}).toArray((err, docs) => {
          if (err) console.log(err);
          res.json(docs);
          
          client.close();
        });
      });  
      
    })
 
//issue new tracker  
    .post(function (req, res){
    var project = req.params.project;
      const body = req.body;
      const newEntry = {
        issue_title: body.issue_title,
        issue_text: body.issue_text,
        created_by: body.created_by,
        created_on: new Date(),
        updated_on: new Date(),
        assigned_to: body.assigned_to || "",
        status_text: body.status_text || "",
        open: true
      }
      
       if (body.issue_title === undefined || (body.issue_text === undefined || body.created_by === undefined)) return res.type('text').send('missing inputs')
    
      MongoClient.connect(CONNECTION_STRING, function(err, client) {
        if(err) console.log('Database error: ' + err);
        var db = client.db("project");
        
        db.collection("project").insertOne(newEntry, (err, docs) => {
          if (err) res.json(err);
          res.json(docs.ops[0]);
          client.close();
        });
      });
    })
      


//update tracker    
    .put(function (req, res){
    var project = req.params.project;
      const _id = req.body._id;
    
    //chech if the id is valid
    if (ObjectId.isValid(_id)==false){
      return res.type('text').send('could not update '+_id);
    }
    
      const body = req.body;  
    
      let updatedEntry = Object.keys(body).reduce(function(obj, key) {
        if (body[key] !== '' && key !== '_id') obj[key] = body[key];
        return obj;
      }, {});
    
    console.log(updatedEntry.open)
      if (updatedEntry.open === 'on') updatedEntry.open = false;
      if (updatedEntry.open === 'false') updatedEntry.open = false;
      if (updatedEntry.open === 'true') updatedEntry.open = true;
      
      if (Object.keys(updatedEntry).length > 0) updatedEntry.updated_on = new Date();
    
      MongoClient.connect(CONNECTION_STRING, function(err, client) {
        var db = client.db("project");
        db.collection("project").updateOne({_id: ObjectId(_id)}, {$set: updatedEntry}, (err, docs) => {
          if (err) {
            client.close();
            if (Object.keys(updatedEntry).length === 0) return res.type('text').send('no updated field sent')
          }
          
          if (docs.result.n === 0) {
            res.type('text').send('successfully updated'); //res.type('text').send('could not update ' + _id);
          } else res.type('text').send('successfully updated');
          
          client.close();
        });
      });
    })
  
  
//delete tracker
  
    .delete(function (req, res){
    var project = req.params.project;
      const _id = req.body._id;
    
    //chech if the id is valid
    if (ObjectId.isValid(_id)==false){
      return res.type('text').send('could not find '+_id);
    }
    
      MongoClient.connect(CONNECTION_STRING, function(err, client) {
        var db = client.db("project");
        db.collection("project").findOneAndDelete({_id: ObjectId(_id)}, (err, docs) => {
          if (err) {
            client.close();
            return res.type('text').send('could not delete ' + _id);
          }
          if (docs.value === null) {
            res.type('text').send('_id error. _id has been deleted.');
          } else res.type('text').send('deleted ' + _id);
          
          client.close();
        });
      });
    });
    
};
