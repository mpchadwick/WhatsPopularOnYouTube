'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
])

.config(function ($routeProvider, $sceDelegateProvider) {
    
  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'http://www.youtube.com/**',
    'http://i1.ytimg.com/**',
    'http://api.wordnik.com:80/**'
  ]);

  $routeProvider.when('/', {
  	controller: 'MainCtrl',
    templateUrl: 'partials/partial1.html'
  }).otherwise({
  	redirectTo: '/'
  })

});
;'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  
.controller('MainCtrl', ['$scope', '$http', '$routeParams', '$location', function($scope, $http, $routeParams, $location) {

  // Helper Functions
  function commaSeparateNumber(val){
    while (/(\d+)(\d{3})/.test(val.toString())){
      val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
    }
    return val;
  };

  $http.get('js/regions.json').success(function(data) { $scope.regions = data; });
  $http.get('js/categories.json').success(function(data) { $scope.categories = data; });

  // Defaults
  $scope.place = 'WW';
  $scope.curCategory = 'All';
  $scope.time = 'today';

  var gData = 'http://gdata.youtube.com/feeds/standardfeeds/';
  var gDataSearch = 'https://gdata.youtube.com/feeds/api/videos'

  $scope.getData = function() {
    
    var place = ($scope.place === 'WW') ? '' : $scope.place + '/';
    var category = ($scope.curCategory === 'All') ? '' : '_' + $scope.curCategory;
    var time = $scope.time;
  
    var maxResults = 10;
    var URL = gData + place + 'most_popular' + category + '?alt=json&time=' + time + '&max-results=' + maxResults;

    $http.get(URL).success(function(data) {
      angular.forEach(data.feed.entry, function(entry) {
        //entry.published.$t = moment(entry.published.$t).format('MMM Do, YYYY, h:mm a');
        entry.yt$statistics.viewCount = commaSeparateNumber(entry.yt$statistics.viewCount); // Add commas
        entry.vidSrc = 'http://www.youtube.com/embed/' + entry.media$group.yt$videoid.$t; // Need to concatenate hear, can't do in view for security reasons
        entry.rating = (entry.gd$rating) ? Math.round(entry.gd$rating.average * 10) / 10 : 'N/A';
        var duration = entry.media$group.yt$duration.seconds, minutes = Math.floor(duration / 60), seconds = duration - minutes * 60;
        entry.duration = minutes + ':' + seconds;
        entry.description = entry.media$group.media$description.$t;
      });
    
      $scope.entries = data.feed.entry;
    });
  };

  $scope.getData();

  // Random Videos
  var minCorpusCount = 100;
  var wAPIKey = '720595cadd0346704c00b0c603303402eccccc35e47f9f103';
  var wURL = 'http://api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=true&minutes=' + minCorpusCount + '&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=0&maxLength=-1&api_key=' + wAPIKey;
  $scope.getRandomVideos = function() {
      $http.get(wURL).success(function(data) { $scope.randomWord = data.word});
  }
  var maxNvs = 10;
  $scope.$watch('randomWord', function(randomWord) {
    if(randomWord) {
      var nvURL = gDataSearch + '?q='+randomWord+'&alt=json&max-results=' + maxNvs;  
      $http.get(nvURL).success(function(data) {
        console.log(data.feed);
        $scope.nvs = data.feed.entry;
      });
    }
  })

  if(window.innerWidth > 799) {
    $scope.getRandomVideos();
  } else {
    window.onresize = function(event) {
      if(window.innerWidth > 799) {
        $scope.getRandomVideos();
        window.onresize = function(event) { /* Do nothing */ };
      }
    }
  }

}]);;if(!Modernizr.svg) {
	var HTML = '<img src="img/logo.jpg" alt="logo" width="299" height="134" />';
	document.getElementById('logo').innerHTML = HTML;
};'use strict';

/* Directives */


angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])

  .directive('nonSuckyYoutubeEmbed', function factory() {
	var directiveDefinitionObject = {
		restrict: 'E',
		template: 	'<div style="position: relative;">' +
				  		'<img style="position: absolute; left: 50%; top: 50%; width: 48px; height: 48px; margin-left: -24px; margin-top: -24px; cursor: pointer;" alt="Play" src="img/play-btn.png" />' +
				  		'<img src="http://i.ytimg.com/vi/{{id}}/0.jpg" style="width: 100%; height: auto; display: inline; cursor: pointer" alt="" />' +
				  	'</div>',
		scope: {
			id: '@id'
		},
		link: function(scope, element, attrs) {
			attrs.$observe('id', function(id) {
				if(id) {
					var height = (attrs.height) ? attrs.height : 390;
					var width = (attrs.width) ? attrs.width : 640;
					var paddingBottom = ((height / width) * 100) + '%';
					var iframeStyle = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%';
					var iframeContainerStyle = 'position: relative; padding-bottom: '+paddingBottom+'; padding-top: 30px; height: 0; overflow: hidden;'
					element.on('click', function() {
						var v = '<iframe type="text/html" style="'+iframeStyle+'" width="'+width+'" height="'+height+'" src="http://youtube.com/embed/'+id+'?autoplay=1" frameborder="0" />'
						var newHTML =	'<div style="'+iframeContainerStyle+'">' + v + '</div>';
						element.html(newHTML);
					});
				}
			});
		}
	};
	return directiveDefinitionObject;
});
;'use strict';

/* Filters */

angular.module('myApp.filters', []).

filter('truncate', function() {
	return function(text, length, end) {
		length = (isNaN(length)) ? '10' : length;
		end = (end === undefined) ? "..." : end;
		if(text.length <= length || text.length - end.length <= length) {
			return text;
		} else {
			return text.substring(0, length - end.length) + end;
		}

	};
});
;'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  value('version', '0.1');
