angular.module("sdco-tools",["sdco-tools.directives","sdco-tools.services","ngSanitize","ui.bootstrap"]),angular.module("sdco-tools.directives",["ui.bootstrap","sdco-tools.services"]),angular.module("sdco-tools.directives").directive("sdcoCustomEventActions",["$log",function(){return{restrict:"A",scope:{currentIndex:"="},link:function(e,t){t.on("keydown",function(t){e.$apply(function(){37==t.keyCode?e.currentIndex--:39==t.keyCode&&e.currentIndex++})})}}}]),angular.module("sdco-tools.directives").factory("editorTabLinkFn",["sdcoEditorService",function(e){return function(t){return function(o,n,i,s){var r=s.getNbEditors(),c=s.getScope().readOnly;o.editor=e.installEditor(n[0].querySelector(".editorElement"),t,o.type,r,c),"html"==o.type&&s.confirmPreview(),c||o.editor.on("change",function(){o.$apply(function(){s.getScope().checkAndProcessContent()})}),s.addTabScope(o)}}}]).directive("sdcoEditorTab",["$log","editorTabLinkFn",function(e,t){return{require:"^sdcoEditor",restrict:"E",priority:1e3,replace:!0,scope:{type:"@",heading:"@"},template:function(e){return'<div><div class="initialContent">'+e.html()+'</div><div class="editorElement" ng-show="selected" /></div>'},compile:function(e){var o=e.text().trim();return angular.element(e[0].querySelector(".initialContent")).contents().remove(),t(o)}}}]),angular.module("sdco-tools.directives").factory("sdcoEditorLinkFn",["sdcoEditorService",function(e){return function(t,o,n,i){t.checkAndProcessContent=function(){t.contents=e.run(),t.compile&&!t.isCompileOnDemand()&&i.processEditorsContent()},t.checkAndProcessContent(),angular.forEach(t.tabScopes,function(e){e.editor.setSize("100%",t.height)}),t.wrapperStyle={width:t.width},t.settingsMenu=function(){var e=[{label:"jsFiddle",selected:t.isFiddle(),select:function(){t.jsFiddle=!0},deselect:function(){t.jsFiddle=!1}}];return t.compile&&e.push({label:"compile on demand",selected:t.isCompileOnDemand(),select:function(){t.compileOnDemand=!0},deselect:function(){t.compileOnDemand=!1}}),e}()}}]).factory("sdcoEditorControllerFn",["$templateCache","sdcoEditorService",function(e,t){return function(o){var n=o.tabScopes=[],i=0;o.preprocess=function(){o.contents=t.run()},o.processHtml=function(){if(void 0!==o.contents.html){i=(i+1)%2;var t="contents"+i+".html";e.put(t,o.contents.html),o.htmlTemplateUrl=t}},o.processCss=function(){if(void 0!==o.contents.css){var e="dynamicEditorStyles",t=angular.element(document.querySelector("#"+e));0===t.length&&(t=angular.element("<style />").attr("type","text/css").attr("id",e),angular.element(document.querySelector("head")).append(t)),t.text(o.contents.css)}},o.processJs=function(){if(o.contents.javascript){var e="dynamicEditorJs",t=angular.element(document.querySelector("#"+e));0!==t.length&&t.remove(),t=angular.element("<script />").attr("type","text/javascript").attr("id",e),angular.element(document.querySelector("body")).append(t),t.text(o.contents.javascript)}},this.processEditorsContent=o.processEditorsContent=function(){var e=function(){if(o.htmlProcessed=!1,o.processHtml(),o.processCss(),o.htmlProcessed)o.processJs();else var e=o.$watch("htmlProcessed",function(t){t&&(e(),o.processJs(),o.htmlProcessed=!1)})},t=function(){o.processJs(),o.processHtml(),o.processCss()};o.compile&&(o.preprocess(),"true"===o.compileJsFirst?t():e())},this.getNbEditors=function(){return n.length},this.addTabScope=function(e){0===n.length&&(e.selected=!0),n.push(e)},this.getScope=function(){return o},this.confirmPreview=function(){o.confirmPreview=!0},o.isFiddle=function(){return"true"===o.jsFiddle||o.jsFiddle===!0},o.isCompileOnDemand=function(){return"true"===o.compileOnDemand||o.compileOnDemand===!0},o.selectTab=function(e){angular.forEach(n,function(e){e.selected=!1}),e.selected=!0},o.needPreview=function(){return o.compile===!0&&o.confirmPreview}}}]).directive("sdcoEditor",["sdcoEditorLinkFn","sdcoEditorControllerFn","$log",function(e,t){return{restrict:"E",transclude:!0,replace:!0,scope:{compile:"=",compileJsFirst:"@?",compileOnDemand:"@",readOnly:"@",width:"@",height:"@",jsFiddle:"@",displayTitle:"@"},template:'				<section class="editor-wrapper" ng-style="wrapperStyle"> 					<h1 ng-if="displayTitle">dynamic editor</h1> 					<div class="editor-preview-wrapper" ng-show="needPreview()"> 						<h2><span>preview</span></h2> 						<div ng-include src="htmlTemplateUrl" onload="htmlProcessed=true;" /> 					</div> 					<ul class="tabs-wrapper"> 						<li 							ng-repeat="tabScope in tabScopes" 							ng-class={selected:tabScope.selected} 							ng-click="selectTab(tabScope)" 							title="{{tabScope.heading}}" 						> 							<a href="">{{tabScope.heading}}</a> 						</li> 					</ul> 					<ul class="functions-wrapper"> 						<li ng-if="isFiddle()"> 							<sdco-js-fiddle fwk="AngularJS" version="1.2" title="test" desc="test" data="contents" /> 						</li> 						<li ng-if="compile && isCompileOnDemand()"> 							<a href="" class="compile-on-demand" ng-click="processEditorsContent()"></a> 						</li> 						<li> 							<section class="menu-options"> 								<sdco-options-menu settings-content="settingsMenu"></sdco-options-menu> 							</section> 						</li> 					</ul> 					<div ng-transclude /> 				</section> 			',link:e,controller:["$scope","$element","$transclude",t]}}]),angular.module("sdco-tools.directives").directive("sdcoJsFiddle",["$log","$sce",function(e,t){return{restrict:"E",replace:!0,scope:{fwk:"@",version:"@",title:"@",desc:"@",data:"="},template:'			<form 				method="post" 				action={{fiddleUrl}} 				target="check" 				class="jsfiddle" 			> 				<a href=""></a> 				<div ng-show="false"> 					<textarea type="text" name="html" ng-model="data.html" ng-trim="false" ></textarea> 					<textarea type="text" name="js" ng-model="data.javascript" ng-trim="false" ></textarea> 					<textarea type="text" name="css" ng-model="data.css" ng-trim="false" ></textarea> 				</div> 				<input type="text" name="title" ng-model="title" ng-show="false" ng-if="title"> 				<input type="text" name="description" ng-model="desc" ng-show="false" ng-if="desc"> 			</form>			',link:function(e,o){o.find("a").on("click",function(){o[0].submit()}),e.fiddleUrl=t.trustAsResourceUrl("http://jsfiddle.net/api/post/"+e.fwk+"/"+e.version+"/")}}}]),angular.module("sdco-tools.directives").directive("sdcoNotesExport",["$log","$modal","sdcoNotesService",function(e,t,o){var n=function(e,t){e.getAllNotes=function(){e.allNotes=JSON.stringify(o.exportNotes())},e.saveNotes=function(){o.importNotes(JSON.parse(e.allNotes))},e.globalNote=o.getGlobalNote(),e.saveGlobalNote=function(){o.saveNote(e.globalNote)},e.close=function(){t.dismiss("cancel")}};return{restrict:"E",scope:{},replace:!0,template:'<button class="main-note" ng-click="open()" ></button>',link:function(e){var o=function(){return'<div sdco-stop-keydown-propagation style="font-size: small;">	<tabset>		<tab heading="Your notes">			<div class=	"modal-header"> Your Notes </div>			<div class="modal-body">			<p> Copy this content in a file to save your comments or 			replace the content with your one to update all the notes </p>			<h2>Your notes</h2>			<textarea ng-model="globalNote.note" rows="10" style="width:100%;" >			</textarea>			<input type="submit" ng-click="saveGlobalNote()" value="save" />			<button ng-click="close()">close</button> 			</div> 		</tab>		<tab heading="all notes" select="getAllNotes()">			<div class=	"modal-header"> All Notes </div>			<div class="modal-body">			<p> Set your global notes here </p>			<h2>Your notes</h2>			<textarea ng-model="allNotes" rows="10" style="width:100%;" >			</textarea>			<input type="submit" ng-click="saveNotes()" value="save" />			<button ng-click="close()">close</button> 			</div> 		</tab>	</tabset></div>'};e.open=function(){t.open({template:o(),controller:["$scope","$modalInstance",n]})}}}}]),angular.module("sdco-tools.directives").directive("sdcoNotes",["$log","$modal","$rootScope","sdcoNotesService",function(e,t,o,n){var i=function(e,t){e.saveNote=function(){n.saveNote(e.noteData)},e.close=function(){t.dismiss("cancel")}};return{restrict:"E",transclude:!0,replace:!0,scope:{},template:'<button class="local-note" ng-click="open()" ng-transclude></button>',link:function(e,s){e.noteData=n.getNote();var r=s,c=r.html();r.contents().remove();var l=function(){return'<div sdco-stop-keydown-propagation style="font-size: small;"> <div class="modal-header"> Notes </div> <div class="modal-body"><p>'+c+'</p><h2>Your notes</h2><textarea ng-model="noteData.note" rows="10" style="width:100%;" ></textarea><button ng-click="saveNote()">save</button><button ng-click="close()">close</button></div> </div>'};e.open=function(){t.open({template:l(),scope:function(){var t=o.$new();return t.noteData=e.noteData,t}(),controller:i})}}}}]),angular.module("sdco-tools.directives").directive("sdcoOptionsMenu",["$log",function(){return{restrict:"E",replace:!0,scope:{settingsContent:"="},template:'		<ul class="menu-settings"> 			<li> 				<a href="" class="main-menu" ng-click="expanded=!expanded"> 				</a> 			</li> 			<li> 				<ul class="menu-list" ng-show="expanded"> 					<li 						ng-repeat="currentOption in settingsContent" 						ng-click="applyAction(currentOption)" 					> 						<a 							href="" 							title="{{currentOption.label}}" 							ng-class="{\'menu-selected\':currentOption.selected}"> 							{{currentOption.label}} 						</a> 					</li> 				</ul> 			</li> 		</ul> 		',link:function(e){e.expanded=!1,e.applyAction=function(t){t.selected&&t.deselect&&t.deselect(),!t.selected&&t.select&&t.select(),t.selected=!t.selected,e.expanded=!1}}}}]),angular.module("sdco-tools.directives").directive("sdcoStopKeydownPropagation",function(){return{restrict:"A",link:function(e,t){t.on("keydown",function(e){e.stopPropagation()})}}}),angular.module("sdco-tools.services",["ngSanitize"]),angular.module("sdco-tools.services").provider("sdcoEditorService",function(){this.isStorageActive=!1;var e=function(e,t,o,n){var i={},s=function(e){return"sdcoEditor"+e},r=function(){var e=[];return angular.forEach(i,function(t,o){var n=(t.getOption("mode"),t.getValue());e.push({id:o,content:n})}),e},c=function(){o.$on("$locationChangeStart",function(e,t,o){var n=s(o);angular.element(document.querySelector("body")).data(n,r()),i={}})};n&&c();var l=function(){var e=s(t.absUrl());return angular.element(document.querySelector("body")).data(e)};this.installEditor=function(e,t,o,s,r){if(n){var c=l(),a=c&&c[s]&&c[s].content;a&&(t=a)}var d={value:t,mode:{},lineNumbers:"true",theme:"eclipse",lineWrapping:!0,readOnly:r};switch(o){case"javascript":d.mode.name="javascript";break;case"html":d.mode.name="xml",d.htmlMode=!0;break;case"css":d.mode.name="css"}return editor=CodeMirror(e,d),angular.element(editor.getWrapperElement()).on("keydown",function(e){e.stopPropagation()}),i[s]=editor,editor},this.getInstalledEditors=function(){return i},this.setInstalledEditors=function(e){i=e},this.removeEditor=function(e){angular.forEach(i,function(t,o){return e==t?(angular.element(e.getWrapperElement()).remove(),delete i[o],!1):void 0})},this.run=function(){var e="",t="",o="";return angular.forEach(i,function(n){var i=n.getOption("mode"),s=n.getOption("htmlMode");"javascript"==i.name?e+=n.getValue():"css"==i.name?o+=n.getValue():"xml"==i.name&&s&&(t+=n.getValue())}),{javascript:e,html:t,css:o}}};this.$get=["$log","$location","$rootScope",function(t,o,n){return new e(t,o,n,this.isStorageActive)}]}),angular.module("sdco-tools.services").value("sdcoLocalStorageService",localStorage),angular.module("sdco-tools.services").service("sdcoNotesService",["$rootScope","$location","sdcoLocalStorageService",function(e,t,o){this.commonPrefixKey="notes_export",this.unitPrefixKey=this.commonPrefixKey+"_unit",this.currentIndice=0,this.unitMainKey=void 0,this.notes=[],this.globalPrefixKey=this.commonPrefixKey+"_globalNote",this.globalNote="",this.getViewKey=function(){return this.unitPrefixKey+this.unitMainKey},this.exportNotes=function(){var e=[],t=new RegExp(this.commonPrefixKey,"i");for(var n in o){var i=n.match(t);i&&e.push({key:n,note:o[n]})}return e},this.importNotes=function(e){for(var t in e){var n=e[t];o.setItem(n.key,n.note),n.key===this.globalPrefixKey&&(this.globalNote=n.note)}},this.loadViewNotes=function(){var e=[],t=new RegExp(this.getViewKey()+"_\\d","i");for(var n in o){var i=n.match(t);if(i){var s=parseInt(i[0].substring(i[0].length-1));e.push({id:s,note:o[n]})}}this.notes.length=e.length;for(var r in e)this.notes[e[r].id]=e[r].note},this.loadGlobalNote=function(){if(""!==this.globalNote.trim())return this.globalNote;var e=o[this.globalPrefixKey];e&&(this.globalNote=e)},this.getNote=function(){var e={id:this.currentIndice,note:this.notes[this.currentIndice]};return this.currentIndice++,e},this.getGlobalNote=function(){return{note:this.globalNote}},this.saveNote=function(e){void 0!==e.id?(this.notes[e.id]=e.note,o.setItem(this.getViewKey()+"_"+e.id,e.note)):(this.globalNote=e.note,o.setItem(this.globalPrefixKey,e.note))},this.init=function(){var o=this;e.$on("$locationChangeSuccess",function(){var e=t.url();o.unitMainKey=e,o.currentIndice=0,o.loadViewNotes(),o.loadGlobalNote()})},this.init()}]);