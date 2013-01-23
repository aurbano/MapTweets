/*
 *	mapTweets
 *	Displays tweets about a topic on a map
 *
 *	Requirements:
 *		- countries.js
 *		- langCountry.js
 *		- Already inserted map from Google Maps API
 *
 *	Project page: http://github.com/aurbano
 *
 *	Developed by Alejandro U. Álvarez <alejandro@urbanoalvarez.es>
 *
 *	Licensed under the MIT License
 */
var mapTweets = function(map, topic){
	return {
		tweets : new Array(),
		last : 0,
		count : 10,
		loading : false,
		topic : topic,
		map : map,
		
		/*
		 *	loadTweets
		 *	Loads next batch of tweets
		 */
		loadTweets : function(callback){
			var mT = this;
			mT.loading = true;
			$.get("http://search.twitter.com/search.json", { since_id:mT.last, q:mT.topic, count:mT.count},
				function(data){
					for(var i=0;i<data.results.length;i++){
						mT.tweets.push(data.results[i]);
						mT.last = data.results[i].id;
					}
					mT.loading = false;
					if(callback!==undefined) callback.call();
			 }, "jsonp");
		},
		
		/*
		 *	convertAddress
		 *	Takes any address and returns the location
		 *	in an object using Google's Geocoder API.
		 *	Ya = latitude, Za = longitude
		 */
		convertAddress : function(address, callback) {
			var geocoder = new google.maps.Geocoder();
			geocoder.geocode( { 'address': address}, function(results, status) {
				if (status == 'OK') {
					callback(results[0].geometry.location);
					return;
				}else{
					callback(false);
					return;
				}
			});
		},
		
		/*
		 *	nextTweet
		 *	Takes the next tweet from the list, and gets its location
		 *	if the tweet doesn't have a location set, it guesses it
		 *	based on the language the tweet is written in.
		 *	That would mean that the tweet could be placed on the wrong country
		 *	as long as they speak the same language.
		 */
		nextTweet : function(){
			var mT = this,
				tweet = mT.tweets[0],
				country,
				lat,
				lng;
			mT.tweets = mT.tweets.slice(1);
			// Cargar localizacion
			if(tweet.geo!==null){
				lat = tweet.geo[0];
				lng = tweet.geo[1];
				mT.displayTweet(tweet, lat, lng);
			}else{
				// Primero sacamos un pais
				var list = langCountry[tweet.iso_language_code];
				if(list==undefined) return this.nextTweet();
				// Selecciono uno de los paises donde se habla ese idioma
				country = countries[list[Math.floor(Math.random()*list.length)]];
				//country = countries[tweet.iso_language_code.toUpperCase()];
				mT.convertAddress(country, function(l){
					if(l==undefined || l==false) return mT.nextTweet();
					lat = l.Ya+Math.sin(Math.random())*3;
					lng = l.Za+Math.cos(Math.random())*3;
					mT.displayTweet(tweet, lat, lng);
				});
			}
		},
		
		/*
		 *	displayTweet
		 *	Puts a marker for the tweet in the latitude and longitude specified
		 *	The tweets must have at least the following properties:
		 *		- from_user
		 *		- text
		 */
		displayTweet : function(tweet, lat, lng){
			var mT = this,
				tw = new google.maps.Marker({
					position: new google.maps.LatLng(lat, lng),
					animation: google.maps.Animation.DROP,
					title:"@"+tweet.from_user+": "+tweet.text
				});
			tw.setMap(mT.map);
			
			// Cargar mas
			if(mT.tweets.length < 10 && !mT.loading) mT.loadTweets();
			// Mostramos el siguiente
			setTimeout(function(){
				mT.nextTweet();
			},2000*Math.random()+100);
		},
		
		/*
		 *	start
		 *	Start loading and displaying tweets
		 */
		start : function(){
			var mT = this;
			this.loadTweets(function(){
				mT.nextTweet();
			});
		}
	};
};