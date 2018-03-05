var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var promise = require('promise');

var listOfURL = [];

var base = []
var researchPage = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin';

var i = 40;
var listOfPages = [];

var restaurants = [];

function GetURLOfTheRestaurant(url){
    return new Promise(function (resolve, reject){
       request(url,async function(err, resp, html) {
            if (err)
                {
                    return reject("ERROR : " + err);
                }
           else
                {
                    var $ = cheerio.load(html);
                    var data =  ExtractURL($);
                    var restaurantsPromises = data.map(url => GetInformationsOfTheRestaurant('https://restaurant.michelin.fr' + url)); 
                    var getInfo =await Promise.all(restaurantsPromises);
                    listOfURL = listOfURL.concat(data);
                    return resolve(data);
                }
       });
    });
}

function GetInformationsOfTheRestaurant(url)
{
    return new Promise(function(resolve, reject){
        request(url, function(err,resp,html){
            if (err)
                {
                    return reject("ERROR : " + err);
                }
           else
               {
                   var $ = cheerio.load(html);
                   
                   var restaurantStars = {};
                   restaurantStars["name"] = $('.poi_intro-display-title')['0'].children[0]['data'].trim();
                   restaurantStars.prix = $('.poi_intro-display-prices')['0'].children[0]['data'].trim();
                   restaurantStars.style = $('.poi_intro-display-cuisines').text().trim();
                   
                   if($('.thoroughfare')[0] == undefined)
                       {
                            restaurantStars.addresse = "Pas d'adresse disponible";   
                       }
                   else
                       {
                            restaurantStars.addresse = $('.thoroughfare')[0].children[0]['data'].trim();
                       }
                   if($('.avg-rating-points')[0] == undefined)
                       {
                       restaurantStars.note = "Aucun avis.";
                       restaurantStars.nombreAvis = 0; 
                   }
                   else{
                       restaurantStars.note = $('.avg-rating-points')[0].children[0]['data'].trim();
                       restaurantStars.nombreAvis = $('.rating-count')[0].children[0]['data'].trim(); 
                   }
                   restaurants.push(restaurantStars);
                   console.log("doing");
                   return resolve();
               }
        });        
    });
}

async function Scrapp(){
    while(i>0)
        {
            listOfPages.push(researchPage + '/page-' +i);
            i-=1;
        }
    var pagesPromises = await listOfPages.map(url => GetURLOfTheRestaurant(url));
    var justForWait = await Promise.all(pagesPromises);
    console.log("Done");
    console.log("Number of restaurant found = " + restaurants.length)
    var final = JSON.stringify(restaurants);
    Write(final);
}

Scrapp();


function Write(element){
    var fs = require('fs');
    
    fs.writeFile('resultJson.json', element, 'utf8', function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
    });
}


function ExtractURL($){
    var tempListOfURL = []
        $('.poi-card-link').each(function(index,element){
                tempListOfURL.push(element["attribs"]["href"]);
            
             });
    return tempListOfURL;
}
