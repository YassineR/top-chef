var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var promise = require('promise');
var fs = require('fs');

var urlBase = 'https://www.lafourchette.com/search-refine/';


var names = [];


function ReadJson()
{
    var filename = 'resultJson.json';
    var arrayObjects = JSON.parse(fs.readFileSync(filename, 'utf8'));
    
    return arrayObjects;
    
}
async function FindPromotedRestaurants(){
    var str = await ReadJson();
    str.forEach(function(element){
        var name = encodeURI(element.name) ;
        names.push(name);
    });
    var researchedURL = [];
    
    for(i=0; i<names.length;i++){
        researchedURL.push(urlBase.concat(names[i]))
    }
    /*var pagesPromises = await researchedURL.map(url => GetThePromotion(url));
    var justForWait = await Promise.all(pagesPromises);*/
    GetThePromotion(urlBase.concat(encodeURI('Agapé')));
}

function GetThePromotion(url, index)
{
    return new Promise(function(resolve, reject){
        const options = {
            'uri' : url,
            'headers': {
                'cookie':'datadome=AHrlqAAAAAMA6MctiFUM_bUATvY0Xg==',
                'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:58.0) Gecko/20100101 Firefox/58.0"
            }
        };
        request(options, function(err,resp,html){
            if (err)
                {
                    return reject("ERROR : " + err);
                }
           else
               {
                   var $ = cheerio.load(html);
                   /*$('.resultItem-saleType resultItem-saleType--specialOffer')*/
                   var data = $('.resultItem-name');
                   var _name;
                   for(i=0; i<data.length;i++){
                       var tmp = data[i].children[0].children[0].data;
                       for(j=0; j<data.length;j++){
                        if( data[i].children[0].children[0].data[j] == names[index])
                            {
                                _name = data[i].children[0].children[0].data[j];
                            }
                       }
                    }
                   /*data.forEach(function(element){
                      console.log(element); 
                   });*/
               }
        });
    });
}

FindPromotedRestaurants();