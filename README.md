# bovespa-node
Node package that automates download e conversion to JSON of Price Report information (BVBG.086.01 files)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 

### Install

```
$ npm install bovespa-node
```

Additionally, you need to specify a temp folder where the package will download the Price Report files. 
My suggestion is create a folder called temp, right bellow the root of package. 
Otherwise, you will need to change this infomation in config.js file, property tempFolder.

```js
'use strict';

module.exports = {
    url: "http://www.bmfbovespa.com.br/pesquisapregao/download?filelist=",
    tempFolder: "temp",
    priceReport: {
      namespace: "urn:bvmf.217.01.xsd"
    }
}

```

### Usage

```js
const bovespa = require('bovespa-node')
const moment = require('moment')

var yesterday = moment().add(-1, 'd').toDate();

bovespa.getPriceReport(yesterday).then( (data) => {
  
  console.log(data);

  for(var i=0; i < data.reports.length; i++){
    var fileName = data.reports[i].fileName;
    var total = data.reports[i].priceReports.length;
    console.log('\n\nFileName:', fileName);
    console.log('Total:', total);

    var priceReport = data.reports[i].priceReports[0];
    console.log(priceReport);
  }

}, (err) => {
  console.log(err);
});

```

## Authors

* **Silvio Araujo** - *Initial work* - [Repository](https://github.com/saraujojr)

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/saraujojr/bovespa-node/blob/master/LICENSE) file for details

