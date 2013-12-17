'use strict';

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
