'use strict';

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

}]);