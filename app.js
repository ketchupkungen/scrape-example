// Require modules
const express = require('express');
const scraperjs = require('scraperjs');

const app = express();
let newsFromAB = [];
let newsFromDN = [];


async function scrapeAftonbladet(){
  let ab = scraperjs.StaticScraper.create('https://aftonbladet.se');
  let news = await ab.scrape(($)=>{
    return $('a[href*="/nyheter"] h3').map(function(){
      return {
        text: $(this).text(),
        url: 'https://aftonbladet.se' + $(this).closest('a').attr('href')
      };
    }).get();
  });
  newsFromAB = news;
}

async function scrapeDn(){
  let dn = scraperjs.StaticScraper.create('https://dn.se');
  let news = await dn.scrape(($)=>{
    return $('a[href*="/nyheter"] h2, a[href*="/nyheter"] h3').map(function(){
      return {
        text: $(this).text(),
        url: 'https://dn.se' + $(this).closest('a').attr('href')
      };
    }).get();
  });
  newsFromDN = news;
}

// Scrape once every minute
scrapeAftonbladet();
setInterval(scrapeAftonbladet, 60 * 1000);
scrapeDn();
setInterval(scrapeDn, 60 * 1000);

// Routes for JSON

app.get('/ab-news',(req,res) => {
  res.json(newsFromAB);
});

app.get('/dn-news',(req,res) => {
  res.json(newsFromDN);
});

app.get('/all-news', (req, res) => {
  res.json(
    newsFromAB.concat(newsFromDN)
      .sort((a,b) => a.text > b.text ? 1 : -1)
  )
});


app.listen(3000,() => console.log("Listening on port 3000."));