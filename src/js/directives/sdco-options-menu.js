angular.module('sdco-tools.directives')

/**
 * @ngdoc directive
 * @name sdco-tools.directive:menuSettings
 * @restrict E
 * @scope
 *
 * @description
 * Display a basic menu list, and allows to define an action when 
 * an option is selected/deselected
 *
 * @param {array=} settingsContent angular expression evaluating to an array defining the menu.
 * The array must contain well formed objects. Each object must contain the fields
 * <ul>
 *	<li>label: The label displayed in the menu</li>
 *	<li>selected: A boolean to specify that the element is selected</li>
 *	<li>select: A function to execute when the menu is selected</li>
 *	<li>deselect: A function to execute when the menu is deselected</li>
 * </ul>
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