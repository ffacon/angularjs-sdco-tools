angular.module('sdco-tools.directives')
/**
 * @ngdoc directive
 * @name jsFiddle
 * @restrict E
 *
 * @description
 * Add a link which allows to send a post request to jsFiddle
 * Stylesheet (and image) is defined through the jsfiddle class
 *
 * @scope
 *
 * @param {string@} fwk the name of the framework to use (
 * <a href="http://jsfiddle.net/" target="blank">go here</a>
 * to get available values)
 *
 * @param {string@} version the version of the framework (
 * <a href="http://jsfiddle.net/" target="blank">go here</a>
 * to get available values)
 * 
 * @param {string@} title for this jsFiddle
 * 
 * @param {string@} description for this jsFiddle
 *
 * @param {array=} data an array containing 3 string fields to be used
 * for this jsFiddle: {html:'', css:'', js:'' }
 *
 **/
.directive('sdcoJsFiddle', ['$log', '$sce', function($log, $sce){

	return{
		restrict:'E',
		replace: true,
		scope:{
			fwk:'@',
			version:'@',
			title:'@',
			desc:'@',
			data:'='
		},
		template:'\
			<form \
				method="post" \
				action={{fiddleUrl}} \
				target="check" \
				class="jsfiddle" \
			> \
				<a href=""></a> \
				<div ng-show="false"> \
					<textarea type="text" name="html" ng-model="data.html" ng-trim="false" ></textarea> \
					<textarea type="text" name="js" ng-model="data.javascript" ng-trim="false" ></textarea> \
					<textarea type="text" name="css" ng-model="data.css" ng-trim="false" ></textarea> \
				</div> \
				<input type="text" name="title" ng-model="title" ng-show="false" ng-if="title"> \
				<input type="text" name="description" ng-model="desc" ng-show="false" ng-if="desc"> \
			</form>\
			',
		link:function($scope, $element, $attrs){

			//workarround for standard input[type=submit] doesnt work
			$element.find('a').on('click', function(){
				$element[0].submit();
			});

			$scope.fiddleUrl= $sce.trustAsResourceUrl('http://jsfiddle.net/api/post/' + $scope.fwk +'/' + $scope.version +'/');

		}
	};
}]);