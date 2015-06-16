MapTweets
=========

> Display tweets about a certain topic on a Google Maps map in real time

**mapTweets** is a very small JavaScript "plugin" that will allow you to display in real time what people are saying about any topic you want.

It's live on [nuostudio's lab](http://lab.nuostudio.com/maptweets/), although you can simply clone the repo and open `index.html` in your browser.

##Requirements:##
mapTweets requires the following libraries and APIs to work:

- [jQuery](https://github.com/jquery/jquery)
- [Google Maps JavaScript API v3](https://developers.google.com/maps/)
- langCountries.js *(included)*
- countries.js *(included)*

*Note: mapTweets doesn't create the map, it takes it as a parameter.*

##Usage:##
There is not much configuration at the moment, all you have to do is include all required files and create a [new Google Maps map](https://developers.google.com/maps/documentation/javascript/tutorial).

Here is the usual code you would use to embed a map:

```javascript
var opts = {
  zoom: 1,
  center: new google.maps.LatLng(0, 0),
  mapTypeId: google.maps.MapTypeId.ROADMAP
},
map = new google.maps.Map(document.getElementById('map'), opts),
```

Now you must initialize **mapTweets**, it requires the `map` handle and a topic to search for.
*Note: It doesn't start automatically, so you will have to call `start()`*

```javascript
var tweets = new mapTweets(map,'Github');
tweets.start();
```

Feel free to fork this project and help along!

- - - -

Licensed under the MIT license - Developed by [Alejandro U. Alvarez](http://urbanoalvarez.es)

[![Analytics](https://ga-beacon.appspot.com/UA-3181088-16/MapTweets/readme)](https://github.com/aurbano)
