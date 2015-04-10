angular.module('sdco-tools.directives')
.directive('sdcoStopKeydownPropagation', function(){
	return {
		restrict:'A',
		link: function($scope, $element, $attrs){

			$element.on('keydown', function(e){
				console.log('stoped');
				e.stopPropagation();
			});
		}
	}
});
