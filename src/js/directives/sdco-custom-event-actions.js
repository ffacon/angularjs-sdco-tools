angular.module('sdco-tools.directives')

 /**
 * @ngdoc directive
 * @name sdco-tools.directive:sdcoCustomEventActions
 * @restrict A
 *
 * @description
 * TODO: This directive has to be move to another module.
 *
 * @scope
 **/
.directive('sdcoCustomEventActions',[ '$log',
	function($log){
		return{
			restrict: 'A',
			scope:{
				currentIndex:'='
			},
			link:function(scope, element, attrs){

				//Make the element selectable
				element.on('keydown',function(e){
					scope.$apply(function(){
						if (e.keyCode == 37){//left
							scope.currentIndex--;
						}
						else if (e.keyCode == 39){//right
							scope.currentIndex++;
						}
					});
				});
			}
		};
	}

]);