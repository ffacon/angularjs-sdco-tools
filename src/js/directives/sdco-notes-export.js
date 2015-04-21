angular.module('sdco-tools.directives')
/**
 * @ngdoc directive
 * @name sdco-tools.directive:sdcoNotesExport
 * @restrict E
 * @scope
 *
 * @description
 * Allow to:
 * <ul>
 * 	<li>Add an editable global note to your app (say global because it doesn't depend on the view and is unique)</li>
 * 	<li>Export all notes data (local and global)</li>
 * 	<li>Import all notes data (local and global)</li>
 *	<li> Usefull when user wants to keep its notes and changes of browser</li>
 * </ul>
 **/
.directive('sdcoNotesExport',[ '$log', '$modal', 'sdcoNotesService',
	function($log, $modal, sdcoNotesService){

		var exportController= function($scope, $modalInstance){

			//ALL VIEWS NOTES
			$scope.getAllNotes= function(){
				$scope.allNotes= JSON.stringify(sdcoNotesService.exportNotes());
			};

			$scope.saveNotes= function(){
				sdcoNotesService.importNotes(JSON.parse($scope.allNotes));
			};

			//GLOBAL NOTE
			$scope.globalNote= sdcoNotesService.getGlobalNote();
			$scope.saveGlobalNote= function(){
				sdcoNotesService.saveNote($scope.globalNote);
			};

			$scope.close= function(){
				$modalInstance.dismiss('cancel');
			};
		};

		return{
			restrict: 'E',
			scope:{},
			replace: true,
			template:'<button class="main-note" ng-click="open()" ></button>',
			link:function(scope, element, attrs){


				var getModalTemplate= function(){
					return '<div sdco-stop-keydown-propagation style="font-size: small;">' + 
							'	<tabset>' +
							'		<tab heading="Your notes">' +
							'			<div class=	"modal-header"> Your Notes </div>' +
							'			<div class="modal-body">' +
							'			<p> Copy this content in a file to save your comments or ' +
							'			replace the content with your one to update all the notes </p>' +
							'			<h2>Your notes</h2>' + 
							'			<textarea ng-model="globalNote.note" rows="10" style="width:100%;" >' +
							'			</textarea>' +
							'			<input type="submit" ng-click="saveGlobalNote()" value="save" />' +
							'			<button ng-click="close()">close</button> ' +
							'			</div> ' +
							'		</tab>' +
							'		<tab heading="all notes" select="getAllNotes()">' +
							'			<div class=	"modal-header"> All Notes </div>' +
							'			<div class="modal-body">' +
							'			<p> Set your global notes here </p>' +
							'			<h2>Your notes</h2>' + 
							'			<textarea ng-model="allNotes" rows="10" style="width:100%;" >' +
							'			</textarea>' +
							'			<input type="submit" ng-click="saveNotes()" value="save" />' +
							'			<button ng-click="close()">close</button> ' +
							'			</div> ' +
							'		</tab>' +
							'	</tabset>' +
							'</div>';
				};

				scope.open= function(){
					$modal.open({
						template:getModalTemplate(),
						controller: ['$scope', '$modalInstance', exportController]
					});
				};
			}
		};

	}

]);