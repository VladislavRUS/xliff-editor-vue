const fs = require('fs');
const xml2js = require('xml2js');
const fileUpload = require('express-fileupload');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const xliffDir = './xliffs';
const PORT = process.env.PORT || 5000;

function createXliff(jsonXliff) {
  const builder = new xml2js.Builder();
  var xliff = builder.buildObject(jsonXliff);

  return xliff;
}

function parseString(data) {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser();

    parser.parseString(data, (err, result) => {
      resolve(result);
    });
  });
}

app.use(express.static(__dirname + '/dist'));

app.use(bodyParser.json({
  limit: '50mb'
}));

app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));

app.use(fileUpload());

app.use((req, res, next) => {
  res.header('Content-Type', 'application/json');
  res.header('Accept', 'application/json');
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/api/xliffs', (req, res) => {
  const xliffFile = createXliff(req.body);

  res.set('Content-Type', 'text/xml');
  res.send(xliffFile);
});

app.post('/api/upload', (req, res) => {
    console.log(req);
  (async () => {
    const result = await parseString(req.files.file.data.toString());
    
    res.send(result);
  })();
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});