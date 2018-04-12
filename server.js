const express = require('express');
const path = require('path');
const Bourne = require('Bourne');
const morgan = require('morgan');
const multer = require('multer');
const fs = require('fs');

var app = express();
var photos = new Bourne('db/photos.json');
var comments = new Bourne('db/comments.json');
var upload = multer({ dest: 'temp/'}).single('file');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('public'));

app.get('/photos', function (req, res) {
  photos.find(function (err, photos) {
    res.json(photos);
  });
});

app.post('/photos', function (req, res) {
  upload(req, res, function (err) {
    if (err) {
      res.send(err);
      return;
    }

    var tempPath = path.join('temp', req.file.filename);
    var filename = Date.now() + '_' + req.file.originalname;
    var imagesPath = path.join('images', filename);
    var newPath = path.join('public', imagesPath);

    fs.rename(tempPath, newPath, function (err) {
      if (err) {
        res.send(err);
        return;
      }
      var photo = {
        path: '/' + imagesPath,
        caption: req.body.caption
      };
      photos.insert(photo, function (err, photo) {
        res.send(photo);
      });
    });
  });
});

app.get('/*', function (req, res) {
  res.render('index.ejs');
});

app.listen(3000);
