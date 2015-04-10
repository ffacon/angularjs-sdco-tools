angular.module('sdco-tools.directives')
.directive('sdcoNotes',[ '$log', '$modal', 'sdcoNotesService',
	function($log, $modal, sdcoNotesService){

		var notesController= function($scope, $modalInstance, noteData){

			$scope.noteData= noteData;
			
			$scope.saveNote= function(){
				sdcoNotesService.saveNote($scope.noteData);
			};

			$scope.close= function(){
				$modalInstance.dismiss('cancel');
			};			
		};

		return{
			restrict: 'E',
			transclude: true,
			replace: true,
			scope:{},
			template:'<button class="local-note" ng-click="open()" ng-transclude></button>',
			link:function(scope, element, attrs){

				scope.noteData=sdcoNotesService.getNote();

				var transcludeElt= element;
				var modalContent= transcludeElt.html();
				//remove transcluded content
				transcludeElt.contents().remove();

				var getModalTemplate= function(){
					return '<div sdco-stop-keydown-propagation style="font-size: small;"> ' +
								'<div class="modal-header"> Notes </div> ' +
								'<div class="modal-body">' +
									'<p>' + modalContent + '</p>' +
								'<h2>Your notes</h2>' + 
								'<textarea ng-model="noteData.note" rows="10" style="width:100%;" ></textarea>' +
								'<button ng-click="saveNote()">save</button>' +
								'<button ng-click="close()">close</button>' +
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