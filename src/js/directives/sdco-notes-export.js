angular.module('sdco-tools.directives')
.directive('sdcoNotesExport',[ '$log', '$modal', 'sdcoNotesService',
	function($log, $modal, sdcoNotesService){

		var exportController= function($scope, $modalInstance){

			$scope.notes= JSON.stringify(sdcoNotesService.exportNotes());

			$scope.saveNotes= function(){
				sdcoNotesService.importNotes(JSON.parse($scope.notes));
			};
		};

		return{
			restrict: 'E',
			scope:{},
			template:'\
				<button class="main-note" ng-click="open()" /> \
			',
			link:function(scope, element, attrs){


				var getModalTemplate= function(){
					return '<div style="font-size: small;">' + 
								'<div class="modal-header"> All Notes </div>' +
								'<div class="modal-body">' +
								'<p> Copy this content in a file to save your comments or ' +
								'replace the content with your one to update all the notes </p>' +
								'<h2>Your notes</h2>' + 
								'<textarea ng-model="notes" rows="10" style="width:100%;" >' +
								'</textarea>' +
								'<input type="submit" ng-click="saveNotes()" value="save" />' +
								'</div> \
							</div>';
				};

				scope.open= function(){
					$modal.open({
						template:getModalTemplate(),
						controller: exportController
					});
				};
			}
		};

	}

]);