# angularjs-sdco-tools

## Description

Angular library containing "transverse" components.
The sdco-editor component is based on <b>codemirror</b>.

## System Requirements

<ul>
 <li>node/npm</li>
 <li>global bower executable</li>
</ul>

## Installation

<h3> Retrieve needed dependencies </h3>

<ul>
	<li>Use your existing bower project</li>
	<li>Or, initialize a new bower project : bower init</li>
	<li>Add the angular-sdco-tools dependency: bower --save install angular-sdco-tools</li>
</ul>

<h2> Include stylesheets and js files </h2>

Sure, the path depends the way you serve your files.

<pre>
&lt;link rel="stylesheet" href="styles/sdco-tools.css"&gt;
&lt;!-- ONLY IF YOU NEED TO USE THE sdco-editor COMPONENT
&lt;link rel="stylesheet" href="codemirror/lib/codemirror.css"&gt;
&lt;link rel="stylesheet" href="codemirror/theme/eclipse.css"&gt;
--&gt;
</pre>

<pre>
&lt;script type="text/javascript" src="angular/angular.js"&gt;&lt;/script&gt;
&lt;script type="text/javascript" src="angular-bootstrap/ui-bootstrap-tpls.js"&gt;&lt;/script&gt;
&lt;script type="text/javascript" src="angular-sanitize/angular-sanitize.js"&gt;&lt;/script&gt;
&lt;script type="text/javascript" src="angular-route/angular-route.js"&gt;&lt;/script&gt;
&lt;!-- ONLY IF YOU NEED TO USE THE sdco-editor COMPONENT
&lt;script type="text/javascript" src="codemirror/lib/codemirror.js"&gt;&lt;/script&gt;
&lt;script type="text/javascript" src="codemirror/mode/javascript/javascript.js"&gt;&lt;/script&gt;
&lt;script type="text/javascript" src="codemirror/mode/xml/xml.js"&gt;&lt;/script&gt;
&lt;script type="text/javascript" src="codemirror/mode/css/css.js"&gt;&lt;/script&gt;
--&gt;
</pre>

## API Documentation

Available <a href="http://worldline.github.io/angularjs-sdco-tools/doc/" target="_blank">here</a>

## Samples
Some samples
<p>
<a href="http://worldline.github.io/angularjs-sdco-tools/sample/editor.html" target="_blank">Here</a> 
and
<a href="http://worldline.github.io/angularjs-sdco-tools/sample/notes.html" target="_blank">here</a> 
</p>
