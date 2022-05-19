const fs = require('fs')
var request = require('request')
const phantom = require('phantom');
const rp = require('request-promise');
const express = require('express');
const app = express();
var cors = require('cors');
const BodyParse = require('body-parser')
const AES = require("crypto-js/aes");

var isRunning = false
var currTime = 0
var lastTime = 0

var mainfile = "/var/www/html/rates/rates/index.html"
var supply = "/var/www/html/rates/rates/supply"
var marketcap = "/var/www/html/rates/rates/marketcap"
var currPrice = "/var/www/html/rates/rates/price"
var currPriceNoRound = "/var/www/html/rates/rates/pricenoround"

var mainfile2 = "/var/www/html/rates/index.html"
var supply2 = "/var/www/html/rates/supply"
var marketcap2 = "/var/www/html/rates/marketcap"
var currPrice2 = "/var/www/html/rates/price"
var currPriceNoRound2 = "/var/www/html/rates/pricenoround"

var mainfile3 = "index.html"
const pass = "TXID_PASSWORD123!"
if (!fs.existsSync("/var/www/html/rates/rates")) {
  fs.mkdirSync("/var/www/html/rates/rates", { recursive: true });
}
app.all('', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  // Auth Each API Request created by user.
  next();
});

app.use(function (req, res, next) {
  if (req.path.indexOf('.') === -1) {
    res.setHeader('Content-Type', 'text/html');
  }
  next();
});
app.use('/', express.static(__dirname + '/.well-known'));
app.use(express.static(__dirname + '/'));
app.use(BodyParse.urlencoded({ extended: false }));
app.use(BodyParse.json());
app.use(cors());

// var mainfile = "index.html"
// var supply = "supply"
// var marketcap = "marketcap"
// var currPrice = "price"
// var currPriceNoRound = "pricenoround"
// var priceChangeLoc = "pricechange"

let token = "sjdfjsdhfkshfksdfsd";
var fees = []
var feesv2 = []
var rates = []
var explorers = []
var explorersBeta = []
var coins = {}
var coinsBeta = {}
if (fs.existsSync("index.html")) {
  rates = getJson("index.html");
}
if (fs.existsSync("feev2.json")) {
  feesv2 = getJson("feev2.json");
}
if (fs.existsSync("explorers_fallback_beta.json")) {
  explorersBeta = getJson("explorers_fallback_beta.json");
}
if (fs.existsSync("explorers_fallback.json")) {
  explorers = getJson("explorers_fallback.json");
}
// coins inside walelt
if (fs.existsSync("coins.json")) {
  coins = getJson("coins.json");
}
if (fs.existsSync("coins_beta.json")) {
  coinsBeta = getJson("coins_beta.json");
}

var indexApi = 0;
var cmcApis = ["8b2d5f10-bd92-4378-ad7c-cd143651e185", "3fa2b0bb-19e7-4376-8ec1-55ef62e9b91a", "b69a6dde-262e-401e-855e-46e2be8871db", "be37fcab-017b-4681-be2f-05d7b4ec5f0f",
  "835736bb-cf97-4d6e-a5a6-f08273a15c63", "2126f860-ba74-4e1e-b9f9-667ae60a2e34", "e8cf920e-4d15-4217-8540-20326fed7bdf", "e8cf920e-4d15-4217-8540-20326fed7bdf",
  "95a3018d-6596-4f4c-9079-692d4b3a2050", "7baabb0a-0486-453f-80e4-11303a5b929d", "7baabb0a-0486-453f-80e4-11303a5b929d", "58dd3ed3-b9e6-490b-8135-eb29f910c771",
  "5ce649a3-60c9-4315-87fd-8579eaa8774d", "33591ab9-798c-4613-bd14-d7fe9b5f324e", "33591ab9-798c-4613-bd14-d7fe9b5f324e", "33591ab9-798c-4613-bd14-d7fe9b5f324e",
  "0a46a02e-e607-4e70-8a69-045d33329814", "923db9a7-8eba-4c16-80c2-82e44dfe0f07", "d5f32400-c1c7-4846-98d4-322d4eb139ef", "163eca81-5572-4679-ba57-94bdb142f6ea", //t17-20
  "5a9c49e5-31b8-498d-8483-b75abdbf02ff", "9f7b3081-4d00-45b6-88f5-ca85cb3ab1ac", "9f7b3081-4d00-45b6-88f5-ca85cb3ab1ac", "b4d9b0e3-96f0-4550-8718-d73bf2ff638b",
  "b4d9b0e3-96f0-4550-8718-d73bf2ff638b", "b4d9b0e3-96f0-4550-8718-d73bf2ff638b", "2f618f58-4ad6-49de-8d08-6bfff2a9385e", "2f618f58-4ad6-49de-8d08-6bfff2a9385e", //t25-28
  "974c39d8-b4ce-47cb-80c6-c1a8c97cee02", "17338134-5967-47b7-9616-60b1c324d77a", "a964122d-03f6-4250-a4ae-3db348d3dc27", "a964122d-03f6-4250-a4ae-3db348d3dc27",
  "a964122d-03f6-4250-a4ae-3db348d3dc27", "d038f71a-6026-4032-bc19-dba789f495ee", "d038f71a-6026-4032-bc19-dba789f495ee", "d038f71a-6026-4032-bc19-dba789f495ee",
  "d038f71a-6026-4032-bc19-dba789f495ee", "d038f71a-6026-4032-bc19-dba789f495ee"]; // 40

var usdUrl = "http://www.floatrates.com/daily/usd.json"
var sumUrl = "https://sumcoinindex.com/rates/price2.json"

var coinlistOrigin = ["BTC", "ETH", "TENT", "BCH", "ZEC", "DASH", "ZEN", "BITG", "DGB", "ZEL", "USDT", "BUSD", "LTC", "BTCZ", "SUM", "ZER", "PIRL", "VDL", "DOGE"]
var specialList = ["COBAN"]
var cc = getCoinList();
var coinlist = [...coinlistOrigin, ...cc];
coinlist = coinlist.filter(function (elem, index, self) {
  return index === self.indexOf(elem);
})
coinlist = coinlist.filter(e => e !== null && e !== undefined);
// coins for rates
function getCoinList() {
  try {
    return JSON.parse(fs.readFileSync("coinlist.json"));
  }
  catch (ex) {
    return []
  }
}

fs.writeFileSync("coinlist.json", JSON.stringify(coinlist))

function curlData(urlRequest, params) {
  return new Promise(function (resolve) {
    request.post(urlRequest, {
      json: params
    }, function (error, res, body) {
      var result = {}
      if (error) {
        result.error = true
        result.result = error
      } else {
        result.error = false
        result.result = body
      }
      resolve(result)
    })
  })
}

function getData(urlRequest) {
  return new Promise(function (resolve) {
    request.get(urlRequest, function (error, res, body) {
      var result = {}
      if (error) {
        result.error = true
        result.result = error
      } else {
        result.error = false
        result.result = body
      }
      resolve(result)
    })
  })
}

function getSum(cb) {
  var promisesToMake = [getData(sumUrl)]
  var result = Promise.all(promisesToMake);
  result.then(function (result) {
    cb(result[0])
  }, function (err) {
    cb(null)
  })
}

function getSpecial() {

}
function getUSD(cb) {
  var promisesToMake = [curlData(usdUrl)]
  var result = Promise.all(promisesToMake);
  result.then(function (result) {
    cb(result[0])
  }, function (err) {
    cb(null)
  })
}

function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function getWebsiteContentOld(coin, name, url, id, classname) {
  return new Promise(async function (resolve) {
    var driver = await phantom.create();
    var rtnData = {}
    try {
      var page = await driver.createPage();
      page.on('onConsoleMessage', function (msg) {
        // console.log('phantomjs page console message', msg);
      });
      page.on('onError', function (msg) {
        // console.log('phantomjs page console message', msg);
      });

      page.property("viewportSize", {
        width: 1920,
        height: 1080
      }).then(function () {

      })

      page.on('onResourceRequested', function (requestData) {
        // console.info('Requesting', requestData.url);
      })

      // page.property('onCallback', (data) => {
      //   console.log(data)
      //   if (data.type === "loadFinished") {
      //       // do some testing
      //   }
      // })
      await page.open(url)
      var data = id ?
        await page.evaluate(function (s) {
          return document.getElementsById(s)[0].innerText
        }, id ? id : classname) :
        await page.evaluate(function (s) {
          return document.getElementsByClassName(s)[0].innerText;
        }, id ? id : classname)

      data = standardData(data)
      rtnData.coin = coin
      rtnData.data = parseData(data.split(/\n/))
      rtnData.name = name
      // console.log(rtnData)
      await driver.exit()
      resolve(rtnData)

      function standardData(data) {
        data = data.replace(/ \t|\t |\t/g, '|')
        data = data.replace(/ \n/g, ' ')
        return data
      }
    } catch (ex) {
      fs.appendFileSync('reject.log', ex.toString() + '\n')
      await driver.exit()
      resolve(rtnData)
    }
  })
}

function parseData(data) {
  var rtn = {}
  try {
    var index = data.findIndex(function (e) {
      return e.toLowerCase().includes('price')
    })
    rtn.price = parseFloat(data[index].split('|')[1])
    index = data.findIndex(function (e) {
      return e.toLowerCase().includes('market cap')
    })
    rtn.marketcap = parseFloat(data[index].split('|')[1])
    index = data.findIndex(function (e) {
      return e.toLowerCase().includes('24 hour volume')
    })
    rtn.volume24h = parseFloat(data[index].split('|')[1])
    index = data.findIndex(function (e) {
      return e.toLowerCase().includes('circulating supply')
    })
    rtn.circulating = parseFloat(data[index].split('|')[1])
    index = data.findIndex(function (e) {
      return e.toLowerCase().includes("coin change")
    })
    rtn.change = parseFloat(data[index].split('|')[1])
  } catch (ex) { }
  return rtn
}

function getAllPrice() {
  const promises = [];
  const api = cmcApis[indexApi];
  promises.push(getPrice(api));
  promises.push(getQuotePrice(api));
  return Promise.all(promises).catch(err => {
    if (err.error && err.error.status) {
      console.log(err.error.status.error_message);
    }
    if (err.error && err.error.status && (err.error.status.error_code == 1009 || err.error.status.error_code == 1010)) {
      indexApi += 1;
      if (indexApi >= cmcApis.length)
        indexApi = 0;
      return new Promise((resolve, reject) =>
        setTimeout(function () {
          return getAllPrice().then(resolve).catch(reject);
        }, 10 * 1000),
      )
    }
  })
    .then(res => {
      return res;
    })
}

function getPrice(api) {
  const requestOptions = {
    method: 'GET',
    uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
    qs: {
      'start': '1',
      'limit': '2500',
      'convert': 'USD'
    },
    headers: {
      'X-CMC_PRO_API_KEY': api
    },
    json: true,
    gzip: true
  };
  return rp(requestOptions);
}


function getPrice2(api) {
  const requestOptions = {
    method: 'GET',
    uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
    qs: {
      'start': '4000',
      'limit': '4000',
      'convert': 'USD'
    },
    headers: {
      'X-CMC_PRO_API_KEY': api
    },
    json: true,
    gzip: true
  };
  return rp(requestOptions);
}

function getQuotePrice(api) {
  const requestOptions = {
    method: 'GET',
    uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
    qs: {
      'symbol': specialList.join(','),
      'convert': 'USD'
    },
    headers: {
      'X-CMC_PRO_API_KEY': api
    },
    json: true,
    gzip: true
  };

  return rp(requestOptions);
}

function createData() {
  lastTime = Math.floor(Date.now() / 1000)
  console.log("getting data")

  getUSD(function (data) {
    try {
      data = JSON.parse(data.result)
      var usd = 1
      var usdeur = 1 / data.eur.rate
      var usdrub = 1 / data.rub.rate
      var usdgbp = 1 / data.gbp.rate
      var usdaud = 1 / data.aud.rate

      var finalResult = []

      var usdJson = {}
      usdJson.code = "USD"
      usdJson.symbol = "$"
      usdJson.name = "US Dollar"
      usdJson.rate = parseFloat(usd.toFixed(3))
      usdJson.price = parseFloat(usd.toFixed(3))
      finalResult.push(usdJson)

      var eurJson = {}
      eurJson.code = "EUR"
      eurJson.symbol = "€"
      eurJson.name = "Euro"
      eurJson.rate = parseFloat(data.eur.rate.toFixed(3))
      eurJson.price = parseFloat(usdeur.toFixed(3))
      finalResult.push(eurJson)

      var rubJson = {}
      rubJson.code = "RUB"
      rubJson.symbol = "₽"
      rubJson.name = "Russian Rouble"
      rubJson.rate = parseFloat(data.rub.rate.toFixed(3))
      rubJson.price = parseFloat(usdrub.toFixed(3))
      finalResult.push(rubJson)

      var gbpJson = {}
      gbpJson.code = "GBP"
      gbpJson.symbol = "£"
      gbpJson.name = "U.K. Pound Sterling"
      gbpJson.rate = parseFloat(data.gbp.rate.toFixed(3))
      gbpJson.price = parseFloat((usdgbp).toFixed(3))
      finalResult.push(gbpJson)

      var audJson = {}
      audJson.code = "AUD"
      audJson.symbol = "A$"
      audJson.name = "Australian dollar"
      audJson.rate = parseFloat(data.aud.rate.toFixed(3))
      audJson.price = parseFloat((usdaud).toFixed(3))
      finalResult.push(audJson)

      getAllPrice().then(results => {
        if (results[0] && results[0].status.error_code == 0) {
          var btcPrice
          var ethPrice
          var result = results[0];
          result.data = result.data.concat(Object.values(results[1].data));
          var cc = getCoinList();
          coinlist = [...coinlistOrigin, ...cc];
          coinlist = coinlist.filter(e => e !== null || e !== undefined);
          coinlist = coinlist.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
          })
          // coinlist = getCoinList();
          coinlist.forEach(element => {
            index = result.data.findIndex(function (e) {
              return e.symbol == element
            })
            if (index > -1) {
              // console.log(result.data[index])
              if (element == "BTC") {
                var btcJson = {}
                btcJson.code = "BTC"
                btcJson.symbol = "฿"
                btcJson.name = "Bitcoin"
                btcJson.rate = 1
                btcJson.price = btcPrice = result.data[index].quote.USD.price
                btcJson.pricechange = formatNumber(parseFloat(result.data[index].quote.USD.percent_change_24h).toFixed(2))
                btcJson.marketcap = result.data[index].quote.USD.market_cap
                btcJson.volume24h = result.data[index].quote.USD.volume_24h
                btcJson.circulating = result.data[index].circulating_supply
                finalResult.push(btcJson)
                console.log("BTC price", btcJson)

                var tbtcJson = {}
                tbtcJson.code = "TBTC"
                tbtcJson.symbol = "฿"
                tbtcJson.name = "Bitcoin Testnet"
                tbtcJson.rate = 1
                tbtcJson.price = btcPrice;
                tbtcJson.pricechange = formatNumber(parseFloat(result.data[index].quote.USD.percent_change_24h).toFixed(2))
                tbtcJson.marketcap = result.data[index].quote.USD.market_cap
                tbtcJson.volume24h = result.data[index].quote.USD.volume_24h
                tbtcJson.circulating = result.data[index].circulating_supply
                finalResult.push(tbtcJson)

              } else if (element == "ETH") {
                var btcJson = {}
                btcJson.code = "ETH"
                btcJson.symbol = "E"
                btcJson.name = result.data[index].name
                btcJson.price = ethPrice = result.data[index].quote.USD.price
                btcJson.rate = ethPrice / btcPrice
                btcJson.pricechange = formatNumber(parseFloat(result.data[index].quote.USD.percent_change_24h).toFixed(2))
                btcJson.marketcap = result.data[index].quote.USD.market_cap
                btcJson.volume24h = result.data[index].quote.USD.volume_24h
                btcJson.circulating = result.data[index].circulating_supply
                finalResult.push(btcJson)
              } else {
                var coinJson = {}
                console.log("import", result.data[index]);
                coinJson.code = element
                coinJson.name = result.data[index].quote.USD.name
                coinJson.rate = btcPrice / result.data[index].quote.USD.price
                coinJson.rateETH = ethPrice / result.data[index].quote.USD.price
                coinJson.price = result.data[index].quote.USD.price
                coinJson.pricechange = formatNumber(parseFloat(result.data[index].quote.USD.percent_change_24h).toFixed(2))
                coinJson.marketcap = result.data[index].quote.USD.market_cap
                coinJson.volume24h = result.data[index].quote.USD.volume_24h
                coinJson.circulating = result.data[index].circulating_supply
                finalResult.push(coinJson)

                if (element == 'SIO') {
                  fs.writeFileSync(currPrice, formatNumber(parseFloat(coinJson.price).toFixed(3)), { flag: 'w+' })
                  fs.writeFileSync(currPriceNoRound, formatNumber(parseFloat(coinJson.price)), { flag: 'w+' })
                  fs.writeFileSync(supply, formatNumber(parseFloat(coinJson.circulating).toFixed(2)), { flag: 'w+' })
                  //Market cap
                  fs.writeFileSync(marketcap, formatNumber(parseFloat((coinJson.circulating * coinJson.price).toFixed(2))), { flag: 'w+' })

                  fs.writeFileSync(currPrice2, formatNumber(parseFloat(coinJson.price).toFixed(3)), { flag: 'w+' })
                  fs.writeFileSync(currPriceNoRound2, formatNumber(parseFloat(coinJson.price)), { flag: 'w+' })
                  fs.writeFileSync(supply2, formatNumber(parseFloat(coinJson.circulating).toFixed(2)), { flag: 'w+' })

                  //Market cap
                  fs.writeFileSync(marketcap2, formatNumber(parseFloat((coinJson.circulating * coinJson.price).toFixed(2))), { flag: 'w+' })
                }
              }
            } else {
              console.log("Cannot find " + element + " data")
            }
          });

          // specialList.forEach(element => {
          //   index = result.data.findIndex(function (e) {
          //     return e.symbol == element
          //   })
          //   if (index > -1) {

          //     var coinJson = {}
          //     console.log(result.data[index]);
          //     coinJson.code = element
          //     coinJson.name = result.data[index].quote.USD.name
          //     coinJson.rate = btcPrice / result.data[index].quote.USD.price
          //     coinJson.rateETH = ethPrice / result.data[index].quote.USD.price
          //     coinJson.price = result.data[index].quote.USD.price
          //     coinJson.pricechange = formatNumber(parseFloat(result.data[index].quote.USD.percent_change_24h).toFixed(2))
          //     coinJson.marketcap = result.data[index].quote.USD.market_cap
          //     coinJson.volume24h = result.data[index].quote.USD.volume_24h
          //     coinJson.circulating = result.data[index].circulating_supply
          //     finalResult.push(coinJson)

          //   } else {
          //     console.log("Cannot find " + element + " data")
          //   }
          // });

          if (!finalResult.find(e => e.code == 'SIO')) {
            var coinJson = {}
            const price = 0.25;
            coinJson.code = 'SIO'
            coinJson.name = 'Simplio'
            coinJson.rate = btcPrice / price
            coinJson.rateETH = ethPrice / price
            coinJson.price = price
            coinJson.pricechange = 0
            coinJson.marketcap = 100000
            coinJson.volume24h = 0
            coinJson.circulating = 150000000
            finalResult.push(coinJson)
          }

          fs.writeFileSync(mainfile, JSON.stringify(finalResult), { flag: 'w+' })
          fs.writeFileSync(mainfile2, JSON.stringify(finalResult), { flag: 'w+' })
          fs.writeFileSync(mainfile3, JSON.stringify(finalResult), { flag: 'w+' })
          console.log("finished, sleep 240 secs")
          setTimeout(function () {
            createData()
          }, 4 * 60 * 1000);

          rates = finalResult;
        }
        else {
          setTimeout(function () {
            createData()
          }, 4 * 60 * 1000);
        }
      })
    } catch (ex) {
      console.log("exception, sleep 240 secs")
      setTimeout(function () {
        createData()
      }, 4 * 60 * 1000);
    }

  })
}

createData()

function getWebsiteContent2(url) {
  return new Promise(async function (resolve) {
    var rtnData = []
    getData()

    function getData() {
      request(url, function (error, response, body) {
        // console.error('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        // console.log('body:', body); // Print the HTML for the Google homepage.
        if (response && response.statusCode == 200) {
          try {
            var tbody = body.split("<tbody>")[1].split("</tbody>")[0]
            var split = tbody.split("<tr")
            split.splice(0, 1)
            split.forEach(element => {
              var split = element.split("<td")
              var data = {}
              data.fullName = split[2].split('">')[0].split('data-sort="')[1]
              data.symbol = split[3].split('col-symbol">')[1].split('</td>')[0]
              data.marketcap = split[4].split('data-usd="')[1].split('"')[0]
              data.price = split[5].split('data-sort="')[1].split('"')[0]
              data.circulating = split[6].split('data-sort="')[1].split('"')[0]
              data.volume24h = split[7].split('data-sort="')[1].split('"')[0]
              data.change1h = split[8].split('data-sort="')[1].split('"')[0]
              data.change24h = split[9].split('data-sort="')[1].split('"')[0]
              data.change7d = split[10].split('data-sort="')[1].split('"')[0]
              rtnData.push(data)
            });
            resolve(rtnData)
          } catch (ex) {
            getData()
          }
        } else {
          getData()
        }
      })
    }
  })
}

function getWebsiteContent(coin, name, url) {
  return new Promise(async function (resolve) {
    var rtnData = {}
    getData()

    function getData() {
      request(url, function (error, response, body) {
        // console.error('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        // console.log('body:', body); // Print the HTML for the Google homepage.
        if (response && response.statusCode == 200) {
          try {
            var pricechange = body.split("details-panel-item--price")[2].split("toolbar-buttons")[0]
            pricechange = pricechange.split("toolbar-buttons")[0]
            pricechange = pricechange.split("data-format-percentage")[1].split("</span>")[0].split(">")[1]
            var split = body.split("cmc-cc-summary-table")[1]
            split = split.split("/table")[0]
            split = split.split("<th scope=\"row\">\n")
            var temp = []
            split.forEach(e => {
              if (e.toLowerCase().includes('price') || e.toLowerCase().includes('market cap') || e.toLowerCase().includes('24 hour volume') ||
                e.toLowerCase().includes('circulating supply')) {
                temp.push(e)
              }
            });
            for (var i = 0; i < temp.length; i++) {
              var splt = temp[i].split("\n</th>")
              var data = splt[1].split("<td>")[1].split("</td>")[0].split("</span>")[0].split(">")
              temp[i] = splt[0] + "|" + data[data.length - 1].replace(/,|\n|/g, '')
            }
            temp.push("Coin change|" + pricechange)
            rtnData.coin = coin
            rtnData.data = parseData(temp)
            rtnData.name = name
            resolve(rtnData)
          } catch (ex) {
            getData()
          }
        } else {
          getData()
        }
      })
    }
  })
}

app.post("/addcoin", (req, res) => { // mongoDB
  if (req.body) {
    if (req.body.token == token) {
      console.log("Add new coin", req.body)
      var newCoin = req.body.coin || req.body.ticker;
      if (!coinlist.includes(newCoin)) {
        var cc = getCoinList();
        coinlist = [...coinlistOrigin, ...newCoin, ...cc];
        coinlist = coinlist.filter(function (elem, index, self) {
          return index === self.indexOf(elem);
        })
        coinlist = coinlist.filter(e => e !== null || e !== undefined);
        fs.writeFileSync("coinlist.json", JSON.stringify(coinlist), { flag: 'w+' })
        res.json({ result: "success" });
      }
      else {
        res.json({ result: "failed" });

      }
    }
  }
  res.end();
})

app.get("/rates", (req, res) => { // mongoDB
  res.json(rates);
  res.end();
})

function getJson(file) {
  try {
    var text = fs.readFileSync(file, "utf8");
    text = JSON.parse(text);
    console.log(text);
    return text;
  }
  catch (_) {
    return []
  }
}

app.get("/fees", (req, res) => {
  res.json(fees);
  res.end();
})
app.get("/feesv2", (req, res) => {
  res.json(feesv2);
  res.end();
})
app.get("/explorersv2", (req, res) => {
  res.json({ result: encryptString(JSON.stringify(explorers), pass) });
  res.end();
})

app.get("/explorersbetav2", (req, res) => {
  res.json({ result: encryptString(JSON.stringify(explorersBeta), pass) });
  res.end();
})

app.get("/coinsv2", (req, res) => {
  res.json({ result: encryptString(JSON.stringify(coins), pass) });
  res.end();
})

app.get("/coinsbetav2", (req, res) => {
  res.json({ result: encryptString(JSON.stringify(coinsBeta), pass) });
  res.end();
})

app.get("/explorers", (req, res) => {
  res.json(explorers);
  res.end();
})

app.get("/explorersbeta", (req, res) => {
  res.json(explorersBeta);
  res.end();
})

app.get("/coins", (req, res) => {
  res.json(coins);
  res.end();
})

app.get("/coinsbeta", (req, res) => {
  res.json(coinsBeta);
  res.end();
})

app.get("/interestrate", (req, res) => {
  res.json([{
    StartedTime: 1636035001,
    Rate: 4
  },
  {
    StartedTime: 1636385000,
    Rate: 10
  },
  {
    StartedTime: 1636395000,
    Rate: 15
  },
  {
    StartedTime: 1636946435,
    Rate: 8
  }]);
  res.end();
})

app.get("/nft", (req, res) => {
  res.json({
    "name": "Tinh",
    "symbol": "",
    "description": "I have seen all the works that are done under the sun,\nAnd, behold, all is vanity and vexation of spirit.\nI communed with mine own heart, saying: Lo, I am come to greater state.\nAnd i gave my heart to know \
  wisdom, and to know madness and folly.\nI perceived that this also is vexation of spirit.\nFor in such wisdom is much grief, and he that increases knowledge, increases sorrow.",
    "seller_fee_basis_points": 300,
    "image": "https://i.imgur.com/5C8grZA.png",
    "attributes": [],
    "external_url": "",
    "properties": {
      "files": [
        {
          "uri": "https://www.w3schools.com/html/mov_bbb.mp4",
          "type": "video/mp4"
        }
      ],
      "category": "video",
      "creators": [
        {
          "address": "De11Z7dzQFSKPz7AvjyKKV78aZoDJEtq3PYA3jkpae51",
          "share": 100
        }
      ]
    }
  });
  res.end();
})
app.post("/addcoindata", (req, res) => {
  if (req.body) {
    if (req.body.token == token) {
      console.log("Add new coin", req.body)
      var newCoins = req.body;
      let file;
      let data;
      if (newCoins.env == "prod") {
        file = "coins.json";
        data = coins;
      }
      else {
        file = "coins_beta.json";
        data = coinsBeta;
      }
      if (newCoins.coins && newCoins.coins.length > 0) {
        if (!data.coins) {
          data.coins = []
        }
        var added = newCoins.coins.filter(e => !data.coins.find(ee => e.ticker == ee.ticker && e.type == ee.type));
        data.coins = data.coins.concat(added);
      }
      if (newCoins.promo && newCoins.promo.length > 0) {
        if (!data.promo) {
          data.promo = []
        }
        var added = newCoins.promo.filter(e => !data.promo.find(ee => e.ticker == ee.ticker && e.type == ee.type));
        data.promo = data.promo.concat(added);
      }
      if (newCoins.fee && newCoins.fee.length > 0) {
        if (!data.fee) {
          data.fee = []
        }
        var added = newCoins.fee.filter(e => !data.fee.find(ee => e.ticker == ee.ticker && e.type == ee.type));
        data.fee = data.fee.concat(added);
      }
      if (newCoins.percentage) {
        data.percentage = newCoins.percentage;
      }
      try {
        fs.writeFileSync(file, JSON.stringify(data), { flag: 'w+' })
        if (fs.existsSync("coins.json")) {
          coins = getJson("coins.json");
        }
        if (fs.existsSync("coins_beta.json")) {
          coinsBeta = getJson("coins_beta.json");
        }
        res.json({ result: "success" });
      }
      catch (_) {
        res.json({ result: "failed" });
      }
    }
  }
  res.end();
})

app.post("/removecoindata", (req, res) => {
  if (req.body) {
    if (req.body.token == token) {
      console.log("Remove coins", req.body)
      var newCoins = req.body;
      let file;
      let data;
      if (newCoins.env == "prod") {
        file = "coins.json";
        data = coins;
      }
      else {
        file = "coins_beta.json";
        data = coinsBeta;
      }
      if (newCoins.coins && newCoins.coins.length > 0) {
        // var added = newCoins.coins.filter(e => data.coins.find(ee => e.ticker == ee.ticker && e.type == ee.type));
        data.coins = data.coins.filter(e => !newCoins.coins.find(ee => e.ticker == ee.ticker && e.type == ee.type));
      }
      if (newCoins.promo && newCoins.promo.length > 0) {
        data.promo = data.promo.filter(e => !newCoins.promo.find(ee => e.ticker == ee.ticker && e.type == ee.type));
      }
      if (newCoins.fee && newCoins.fee.length > 0) {
        data.fee = data.fee.filter(e => !newCoins.fee.find(ee => e.ticker == ee.ticker && e.type == ee.type));
      }
      try {
        fs.writeFileSync(file, JSON.stringify(data), { flag: 'w+' })
        if (fs.existsSync("coins.json")) {
          coins = getJson("coins.json");
        }
        if (fs.existsSync("coins_beta.json")) {
          coinsBeta = getJson("coins_beta.json");
        }
        res.json({ result: "success" });
      }
      catch (_) {
        res.json({ result: "failed" });
      }
    }
  }
  res.end();
})

setInterval(() => {
  try {
    if (fs.existsSync("index.html")) {
      rates = getJson("index.html");
    }
  }
  catch (_) { }
  try {
    if (fs.existsSync("fee.json")) {
      fees = getJson("fee.json");
    }
  }
  catch (_) { }
  try {
    if (fs.existsSync("feev2.json")) {
      feesv2 = getJson("feev2.json");
    }
  }
  catch (_) { }
  try {
    if (fs.existsSync("explorers_fallback_beta.json")) {
      explorersBeta = getJson("explorers_fallback_beta.json");
    }
  }
  catch (_) { }
  try {
    if (fs.existsSync("explorers_fallback.json")) {
      explorers = getJson("explorers_fallback.json");
    }
  }
  catch (_) { }
  if (fs.existsSync("coins.json")) {
    coins = getJson("coins.json");
  }
  if (fs.existsSync("coins_beta.json")) {
    coinsBeta = getJson("coins_beta.json");
  }
}, 300000);

function encryptString(text, pass) {
  let data = '';
  if (typeof text == "object") {
    data = JSON.stringify(text);
  } else {
    data = text;
  }
  return AES.encrypt(data, pass.trim()).toString();
}

function decryptString(text, pass) {
  let data = '';
  if (typeof text == "object") {
    data = JSON.stringify(text);
  } else {
    data = text;
  }
  try {
    const dec = AES.decrypt(data, pass.trim());
    return dec.toString(enc.Utf8);
  } catch (ex) {
    return undefined;
  }
}
app.listen(7777);