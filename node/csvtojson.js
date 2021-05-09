const fs = require ('fs');
const path = require('path');
const csv = require('csvtojson');
const scvfolder = '../cm/';
const jsonfolder = './json/';
const directoryPath = path.join(__dirname, scvfolder);
const csvpath = []; 

fs.readdir(directoryPath, function (err, files) {
  if (err) {
      return console.log('Unable to scan directory: ' + err);
  } 
  files.forEach(function (file) {
    if (path.extname(file)==='.csv') {
      let filename =  './cm/' + path.basename (file, '.csv');
      csvpath.push (filename); 
    }

  })
  for (let path1  of csvpath) {
    const csvFilePath = path1 + '.csv';
    let filename = path1.split('/');
    filename = filename [filename.length -1];
    const jsonFilePath = jsonfolder + filename + '.json';
    //console.log (jsonFilePath);
  
    const target = {[filename]: {}}; 
  
  // Convert a csv file with csvtojson
  csv({delimiter:'|', ignoreEmpty: true})
    .fromFile(csvFilePath)
    .then ((jsonObj) => {
      //console.log(jsonObj);
      for (const rec of jsonObj) { 
        if (rec.name[0]!=='-') {
          target[filename][rec.name] = {type: rec.type, adr: Number.parseInt(rec.adr), bit: Number.parseInt(rec.bit) || 0, descr: rec.descr || rec.name}
        }
        //console.log(target);
      }
      fs.writeFileSync (jsonFilePath, JSON.stringify(target))
  })
  }  
});     
