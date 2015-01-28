angular.module('sdco-tools.directives')

/**
 * @ngdoc directive
 * @name menuSettings
 * @restrict E
 *
 * @description
 * Display a basic menu, and allows to define an action when 
 * an option is selected/deselected
 *
 * @scope
 *
 * @param {array=} settingsContent angular expression evaluating to array of objects containing the fields
 * label (String), selected (boolean), select (function) and deselect (function).
 * So the data should look like [{label:'option1', selected: true, select:action1, deselect:action2}, ...].
 *
 * 
 * @param {string=} onload Expression to evaluate when a new partial is loaded.
 **/

.directive('sdcoOptionsMenu', ['$log', function($log){

	return {
		restrict:'E',
		replace:true,
		scope:{
			settingsContent:'='
		},
		template:'\
		<ul class="menu-settings"> \
			<li> \
				<a href="" class="main-menu" ng-click="expanded=!expanded"> \
				</a> \
			</li> \
			<li> \
				<ul class="menu-list" ng-show="expanded"> \
					<li \
						ng-repeat="currentOption in settingsContent" \
						ng-click="applyAction(currentOption)" \
					> \
						<a \
							href="" \
							title="{{currentOption.label}}" \
							ng-class="{\'menu-selected\':currentOption.selected}"> \
							{{currentOption.label}} \
						</a> \
					</li> \
				</ul> \
			</li> \
		</ul> \
		',
		link:  function($scope, $element, $attrs){

			$scope.expanded= false;

			$scope.applyAction= function(currentOption){
				if (currentOption.selected && currentOption.deselect){
					currentOption.deselect();
				}
				if (!currentOption.selected && currentOption.select){
					currentOption.select();
				}
				currentOption.selected= !currentOption.selected;
				$scope.expanded= false;
			};

		}
	};
}]);