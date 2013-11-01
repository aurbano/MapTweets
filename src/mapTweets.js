/*
 *	MapTweets
 *	Displays tweets about a topic on a map
 *
 *	Requirements:
 *		- countries.js
 *		- langCountry.js
 *		- Already inserted map from Google Maps API
 *
 *	Project page: http://github.com/aurbano/MapTweets
 *
 *	Developed by Alejandro U. Álvarez <alejandro@urbanoalvarez.es>
 *
 *	Licensed under the MIT License
 */
var mapTweets = function(map){
	return {
		tweets : new Array(),
		last : 0,
		count : 50,
		loading : false,
		status : false,	// true => started, false => stopped
		topic : null,
		map : map,
		markers : new Array(),
		
		/*
		 *	loadTweets
		 *	Loads next batch of tweets
		 */
		loadTweets : function(callback){
			var mT = this;
			mT.loading = true;
			$.get("https://api.twitter.com/1.1/search/tweets.json?", { since_id:mT.last, q:mT.topic, count:mT.count},
				function(data){
					for(var i=0;i<data.results.length;i++){
						mT.tweets.push(data.results[i]);
						mT.last = data.results[i].max_id_str;
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
				image = new google.maps.MarkerImage(
					tweet.profile_image_url,
					new google.maps.Size(30,30),    // size of the image
					new google.maps.Point(0,0), // origin, in this case top-left corner
					new google.maps.Point(9, 25)    // anchor, i.e. the point half-way along the bottom of the image
				),
				tw = new google.maps.Marker({
					position: new google.maps.LatLng(lat, lng),
					animation: google.maps.Animation.DROP,
					title:"@"+tweet.from_user+": "+tweet.text,
					icon : image
				}),
				infowindow = new google.maps.InfoWindow({
					content: '<a href="https://twitter.com/'+tweet.from_user+'">@'+tweet.from_user+"</a><br />"+mT.linkify(tweet.text)
				});
				
			tw.setMap(mT.map);
			
			mT.markers.push(tw);
			
			google.maps.event.addListener(tw, 'click', function() {
				infowindow.open(map,tw);
			});
			
			if(mT.tweets.length < 10 && !mT.loading) mT.loadTweets();

			if(!mT.status) return;
			
			setTimeout(function(){
				mT.nextTweet();
			},2000*Math.random()+100);
		},
		
		clearMarkers : function(){
			var total = this.markers.length;
			for(var i=0;i<total;i++){
				this.markers[i].setMap(null);
			}
			this.markers = new Array();
			this.tweets = new Array();
		},
		
		linkify : function (text) {
			text = text.replace(/(https?:\/\/\S+)/gi, function (s) {
				return '<a href="' + s + '">' + s + '</a>';
			});
		
			text = text.replace(/(^|)@(\w+)/gi, function (s) {
				return '<a href="http://twitter.com/' + s + '">' + s + '</a>';
			});
		
			text = text.replace(/(^|)#(\w+)/gi, function (s) {
				return '<a href="http://search.twitter.com/search?q=' + s.replace(/#/,'%23') + '">' + s + '</a>';
			 });
			return text;
		},
		
		/*
		 *	start
		 *	Start loading and displaying tweets
		 */
		start : function(topic){
			var mT = this;
			mT.topic = topic;
			mT.status = true;
			this.loadTweets(function(){
				mT.nextTweet();
			});
		},
		
		stop : function(){
			this.status = false;
		}
	};
};