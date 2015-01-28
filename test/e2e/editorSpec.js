describe('editor homepage', function(){

	var ptor = protractor.getInstance();

	beforeEach(function(){
		browser.get('editor.html');
	});


	it('Check tabs are available', function(){
		element.all(by.binding('tabScope.heading')).then(function(elements){
			expect(elements.length).toBe(2);
			expect(elements[0].getText()).toEqual('sample.html');
			expect(elements[1].getText()).toEqual('sample.js');
		});
	});

	it('Display the jsFiddle button', function(){

		//CLick on the parameters menu
		element(by.css('.main-menu')).click();

		//Click on jsFiddle
		element(by.css('a[title="jsFiddle"')).click();

		expect(element(by.css('.jsfiddle')).isPresent()).toBe(true);
	});

	it('The compile on demand button must be available', function(){
		expect(element(by.css('.compile-on-demand')).isPresent()).toBe(true);
	});

	it('The compile button should disappear and appear', function(){

		//DISAPPEAR
		//CLick on the parameters menu
		element(by.css('.main-menu')).click();
		//Click on compile on demand menu -> disappear
		element(by.css('a[title="compile on demand"]')).click();
		//Check compile on demand element appeared
		expect(element(by.css('.compile-on-demand')).isPresent()).toBe(false);


		//APPEAR
		//CLick on the parameters menu
		element(by.css('.main-menu')).click();
		//Click on compile on demand menu -> disappear
		element(by.css('a[title="compile on demand"]')).click();
		//Check compile on demand element appeared
		expect(element(by.css('.compile-on-demand')).isPresent()).toBe(true);
	});

	it('Check compilation button', function(){

		//Click compile button
		element(by.css('.compile-on-demand')).click();
		//Check compilation applied
		expect(element(by.id('afterCompile')).getText()).toEqual('modified');

		//Replace js content
		browser.executeAsyncScript(function(callback) {
			var jsCodemirror= document.querySelectorAll('.CodeMirror')[1];
			jsCodemirror.CodeMirror.setValue('document.getElementById("afterCompile").innerText="modified2";');
			callback();
		});

		//Click compile button
		element(by.css('.compile-on-demand')).click();
		//Check compilation applied
		expect(element(by.id('afterCompile')).getText()).toEqual('modified2');
	});


	it('Check inline compilation', function(){

		//1) Disable compile on demand
		//CLick on the parameters menu
		element(by.css('.main-menu')).click();
		//Click on compile on demand menu -> disappear
		element(by.css('a[title="compile on demand"]')).click();		

		//2) Check inline compilation
		//Replace js content
		browser.executeAsyncScript(function(callback) {
			var jsCodemirror= document.querySelectorAll('.CodeMirror')[1];
			jsCodemirror.CodeMirror.setValue('document.getElementById("afterCompile").innerText="modified2";');
			callback();
		});
		//Check compilation applied
		expect(element(by.id('afterCompile')).getText()).toEqual('modified2');
	});	

	it('Check content remains modified when route changes', function(){

		var newHtmlContent= '<div>newcontent</div>';

		//Replace editor html content
		browser.executeAsyncScript(function(newHtmlContent, callback) {
			var htmlCodemirror= document.querySelectorAll('.CodeMirror')[0];
			htmlCodemirror.CodeMirror.setValue(newHtmlContent);
			callback();
		}, newHtmlContent);

		//Go to view2
		element(by.id('view2')).click();
		//Back to view1
		element(by.id('view1')).click();

		//Get editor HTML content
		var retrievedHtmlContent= browser.executeAsyncScript(function(callback) {
			var res;
			var htmlCodemirror= document.querySelectorAll('.CodeMirror')[0];
			res= htmlCodemirror.CodeMirror.getValue();
			callback(res);
		});

		//Check HTML content is the initial one
		expect(retrievedHtmlContent).toEqual(newHtmlContent);
	});

});