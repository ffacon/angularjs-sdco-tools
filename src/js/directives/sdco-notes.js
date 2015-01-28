angular.module('sdco-tools.directives')
.directive('sdcoNotes',[ '$log', '$modal', 'sdcoNotesService',
	function($log, $modal, sdcoNotesService){

		var notesController= function($scope, $modalInstance, noteData){

			$scope.noteData= noteData;
			
			$scope.saveNote= function(){
				sdcoNotesService.saveNote($scope.noteData);
			};
		};

		return{
			restrict: 'E',
			transclude: true,
			scope:{},
			template:'\
				<button class="local-note" ng-click="open()"> \
				<div ng-show="false" ng-transclude /> \
			',
			link:function(scope, element, attrs){

				scope.noteData=sdcoNotesService.getNote();

				var transcludeElt= angular.element(element[0].querySelector('div[ng-transclude]'));
				var modalContent= transcludeElt.html();
				//remove transcluded content
				transcludeElt.contents().remove();

				var getModalTemplate= function(){
					return '<div style="font-size: small;"> ' +
								'<div class="modal-header"> Notes </div> ' +
								'<div class="modal-body">' +
									'<p>' + modalContent + '</p>' +
								'<h2>Your notes</h2>' + 
								'<textarea ng-model="noteData.note" rows="10" style="width:100%;" />' +
								'<input type="submit" ng-click="saveNote()" value="save" />' +
								'</div> ' +
							'</div>';
				};

				scope.open= function(){
					$modal.open({
						template:getModalTemplate(),
						controller: notesController,
						resolve: {
							noteData: function(){
								return scope.noteData;
							}
          				}
					});
				};
			}
		};

	}

]);