var tuUtils=
(
	function($){

		var tuUtils= function (){
	
			this.triggerKeydown= function(element, keycode){
		        var e= $.Event("keydown");
		        e.which= keycode;
		        e.keyCode= keycode;
		    	element.trigger(e);		
			}

			this.click= function(element){
				var e= $.Event('click');
				element.trigger(e);
			}


			this.getMockedEditor= function(){

				return function(type, content){

		            //spies are useless here, but just in case
		            this.getOption= jasmine.createSpy('getOption')
		            .and.callFake(function(option){
		                if (option == 'mode'){
		                    var currentType= (type=='html' && 'xml') || type;
		                    return {name:currentType};
		                }
		                if (option == 'htmlMode'){
		                    return (type == 'html');
		                }
		            });

		            this.getValue= jasmine.createSpy('getValue')
		            .and.callFake(function(){
		                return content;
		            });

		            this.on= jasmine.createSpy('on');
		        }
			}


		}


		return new tuUtils();

	}
)(jQuery)