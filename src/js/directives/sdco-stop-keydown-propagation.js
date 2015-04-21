angular.module('sdco-tools.directives')
/**
 * @ngdoc directive
 * @name sdco-tools.directive:sdcoStopKeydownPropagation
 *
 * @restrict A
 *
 * @description
 * 	Stop 'keydown' events from the element the directive is placed on
 **/
.directive('sdcoStopKeydownPropagation', function(){
	return {
		restrict:'A',
		link: function($scope, $element, $attrs){

			$element.on('keydown', function(e){
				e.stopPropagation();
			});
		}
	}
});
