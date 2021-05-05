const fs = require ('fs');
const csv = require('csvtojson');

const csvpath = [
  './cm/plccfg',
  './cm/module',
  './cm/submodule',
  './cm/ch_cfg',
  './cm/ch_hmi',
  './cm/divar_sta',
  './cm/divar_cfg',
  './cm/dovar_sta',
  './cm/dovar_cfg',
  './cm/aivar_sta',
  './cm/aivar_cfg',
  './cm/aovar_sta',
  './cm/aovar_cfg',
];
const jsonfolder = './json/';

for (path  of csvpath) {
  const csvFilePath = path + '.csv';
  let filename = path.split('/');
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