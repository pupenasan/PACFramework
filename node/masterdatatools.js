const fs = require ('fs');
const opts = {
  logfile: 'general.log',
  source: 'undefined'
};
let msglog = '';

//синхронізація нового об'єкту з мастерданими 
function syncobs (masterob, newob) {
  let obname = newob.name || newob.tagname; 
  let changesob = {};
  let isnewobj = true;
  for (let fieldname in masterob) {
    isnewobj = false;
    break 
  }
  if (isnewobj===true) { //новий об'єкт
    changesob.new = true;
    logmsg (`Добавлено новий об'єкт ${obname}`);
    for (let fieldname in newob) {
      masterob[fieldname] = newob[fieldname];
    }   
  } else { //змінено об'єкт
    //перебираємо нові властивості
    for (let fieldname in newob) {
      let newfield = newob[fieldname];//нове поле
      let oldfield = masterob[fieldname];//старе поле
      //logmsg (JSON.stringify(newob[fieldname]) ,0)
      if (typeof masterob[fieldname] === 'undefined' ) { //властивість тільки з'явилася
        if (!changesob.addfields) changesob.addfields = [];  
        changesob.addfields.push (fieldname);
        logmsg (`Добавлена нова властивість ${fieldname} в об'єкті ${obname}`,0);
        masterob[fieldname] = newob[fieldname]
      } else {                                          //властивість була
        let jsonold = JSON.stringify(oldfield).toLowerCase;
        let jsonnew = JSON.stringify(newfield).toLowerCase;
        if ( jsonold !== jsonnew) {                   //якщо знайдено зміни
          let oldrecord = {[fieldname]:[]};
          if (!changesob.changedfrom) changesob.changedfrom = [];
          //перевірка на рівень нижче, якщо це об'єкти
          if (typeof newfield === 'object' && oldfield === 'object') {
            for (let includefiled in newfield) {
                let jsonoldi = JSON.stringify(oldfield[includefiled]).toLowerCase;
                let jsonnewi = JSON.stringify(newfield[includefiled]).toLowerCase;
              if ( jsonoldi !== jsonnewi) {
                oldrecord[fieldname].push ({[includefiled]:oldfield[includefiled]});//добавляємо старі поля
                logmsg (`Змінена властивість ${fieldname}.${includefiled} в об'єкті ${obname}, старе значення ${jsonoldi} нове значення ${jsonnewi}`, 0);                
              }
            } 
          } else {
            oldrecord[fieldname].push (oldfield);
            logmsg (`Змінена властивість ${fieldname} в об'єкті ${obname}, старе значення ${jsonold} нове значення ${jsonnew}`, 0);
          }
          changesob.changedfrom.push (oldrecord);//добавляємо старі поля     
          masterob[fieldname] = newfield
        } 
      }  
    }
  }

  //добавлення іформації в поле мастерданих про зміни, якщо такі мають місце
  let changes = JSON.stringify(changesob);
  if (changes.length>2) {
    masterob.lastchanged = {
      date: (new Date()).toLocaleString(),
      changes: changes,
      source: opts.source
    }  
  } 
}

//виведення повідомлення msg на консоль (при toconsole=1) та в msglog 
function logmsg (msg, toconsole=1) {
  let now = new Date ();
  msg = now.toLocaleTimeString() + '.' + now.getMilliseconds() + ' ' + msg;
  msglog += msg  + '\n'; 
  if (toconsole===1) console.log (msg);
}
//виведення msglog в файл, при createnew = 1 - створюється новий файл 
function writetolog (createnew = 0) {
  let now = new Date ();
  msglog = '===============' + now + '\n' + msglog; 
  if (createnew===1) {
    fs.writeFileSync (opts.logfile, msglog, 'utf8');
  } else {
    fs.appendFileSync (opts.logfile, msglog, 'utf8');
  }
}

module.exports = {
  opts, syncobs, logmsg, writetolog
};
