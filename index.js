const fs = require('fs'),
     download = require('download'),
     _ = require('lodash'),
     dateformat = require('dateformat'),
     fstream = require('fstream'),
     decompress = require('decompress'),
     xpath = require('xpath'),
     dom = require('xmldom').DOMParser,
     xmljs = require('xml-js');

var getConfig = () => require('./config/config.js');

var getPriceReportNodes = (xmlDoc) => {

  var priceReports = new Array();
  var doc = new dom().parseFromString(xmlDoc)

  var config = getConfig();
  var namespace = config.priceReport.namespace;

  var nodes = xpath.select(`//*[local-name(.)='Document' and namespace-uri(.)='${namespace}']`, doc);

  for (var i=0; i < nodes.length; i++){
    if (xmljs.xml2js(nodes[i].toString(), {compact: true}).Document.PricRpt) {
      priceReports.push(xmljs.xml2js(nodes[i].toString(), {compact: true}).Document.PricRpt);
    }
  }

  return priceReports;

}

module.exports.getPriceReport = (date) => {

  return new Promise((resolve, reject) => {

    try{

      var config = getConfig();
      var url = config.url;

      var tempFolder = config.tempFolder;

      if (_.isDate(date)) {

          var fileToDownload = 'PR' + dateformat(date, "yymmdd") + '.zip';

          url = url + fileToDownload;
          console.log('Downloading ' + url + '...');

          download(url).then((data) => {
            fs.writeFileSync(`${tempFolder}/download.zip`, data);

            console.log('Unzip files...');

            decompress(`${tempFolder}/download.zip`, `${tempFolder}`).then((files) => {
              return decompress(`${tempFolder}/` + fileToDownload, `${tempFolder}`);
            }, (err) => {
              reject({
                status: 'ERROR',
                errorMessage: 'Unable to unzip the file',
                errorObject: err
              });
            }).then((files) => {

              var reportsArray = new Array();
              for(var i=0;i < files.length; i++){

                var report = new Object();
                report.fileName = files[i].path;
                report.priceReports = getPriceReportNodes(files[i].data.toString('utf-8'));
                reportsArray.push(report);
              }

              resolve({
                  status: 'OK',
                  errorMessage: '',
                  path: `${tempFolder}/` + fileToDownload,
                  reports: reportsArray
                });

            }, (err) => {
              reject({
                status: 'ERROR',
                errorMessage: 'Unable to unzip the file',
                errorObject: err
              });
            });

          }, (err) => {
            reject({
              status: 'ERROR',
              errorMessage: err.statusCode + ':' + err.statusMessage
            });
          });

      }else{
          reject ({
            status: 'ERROR',
            errorMessage: `Invalid Date: ${date}.`
          });
      }

    }catch (e){
      reject({
        status: 'ERROR',
        errorMessage: e.message
      });
    }
  });

}
