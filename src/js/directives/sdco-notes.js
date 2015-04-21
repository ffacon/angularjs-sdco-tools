angular.module('sdco-tools.directives')
/**
 * @ngdoc directive
 * @name sdco-tools.directive:sdcoNotes
 * @restrict E
 * @scope
 *
 * @description
 * Allow to add a note in your views. This note also contain an editable area to let users
 * to add comments and save them. You can add several note in a view, but remember that
 * the note is related to the view where you use it. 
 * For global note, have a look at {@link sdco-tools.directive:sdcoNotesExport sdcoNotesExport}.
 **/
.directive('sdcoNotes',[ '$log', '$modal', '$rootScope', 'sdcoNotesService',
	function($log, $modal, $rootScope, sdcoNotesService){

		var notesController= function($scope, $modalInstance){
			
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
						scope: function(){
							var newScope= $rootScope.$new();
							newScope.noteData= scope.noteData;
							return newScope;
						}(),

						controller: notesController,
					});
				};
			}
		};

	}

]);