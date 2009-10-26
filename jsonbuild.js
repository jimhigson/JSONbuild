

/** "Most usage requires you to use just one function.
*/

var JSON_BUILD = (function(){


/*	first, a few non-prototype-augmenting (functional rather than OOP) versions of 
	functions from Prototype */
 	var Protofake = (function(){

		return
		{	'Function': (function() {

				function update(array, args) { //internal function from Prototype's Function.prototype code
					var arrayLength = array.length, length = args.length;
					while (length--) array[arrayLength + length] = args[length];
					return array;
				}

				return {
			/*	This wrap is purely functional - that is, it doesn't care about this and makes
				no attempt at binding. Once wrapped, all scope is lost. */
					wrap:function(wrappee, wrapper) {
						return function() {
							var a = update(wrappee, arguments);
							return wrapper.apply( null , a);
						}
					}
				};
			})();	
	})();

		
//	stores all the stages	
/*	If buildCore and gather_advice were outside of the pipeline, the line could be executed
	twice perhaps in the event of functional callbacks. 

	In case where functions return objects with more functions, will probably be necessary to 
	run pipeline twice 

	This is unless we do functions first (repeatedly until none left), then push through 
	the pipeline. However, there is a reason I can't remember now why that isn't the best
	way  

	The pipeline could even contain a method, eg repipeline that detects if another run is 
	needed and sends again if so */
	var pipeline = 	[ 	gather_advice, wrapper_advice, multiple_advice, assignment_advice, 
						firstTextnode_advice, cssClassId_advice, hierarchyAttribute_advice, 
						listener_advice, style_advice, class_combine_advice, pseudoattribute_advice, 
						multipleAttribute_advice, 
						buildCore ];

//	assigns pipeline.call to a function to call all advisors. 
//	From end of array (outside) to start (innermost) and back out again.
	pipeline.compile = function() {
	//	start with the innermost frame (frame zero)
		pipeline.call = impl( 0 );

		function impl( i ){

			var frame = pipeline[ i ];
		//	Outermost frame. Return an identity function.

			if( i == pipeline.length-1 ) {
				return frame;
			} else {				
			//	return this frame wrapped in the next frame
				return Protofake.Function.wrap( frame, impl( i++ ) );
			}
		}
	};

	pipeline.compile();



//	JSON_BUILD local masks the global variable in so can refer to
//	using familiar name before actually set globally
	var JSON_BUILD = {

		build:function(){		
			return pipeline.apply( arguments );
		}

	,	advisors:{ 	BUILD: build 
				 ,	PSEUDO_ATTRIBUTE: pseudoattribute_advice
				 ,	STYLES: style_advice
				 ,	GATHER: gather_advice }

	/*	need to decide on how to do ordering */
	,	addAdvice:function( name, func, opts ){
			
			advisors[name] = func;

			if( opts.after ) {
				var i = pipeline.length;
				while( i-- )
				{	if( pipeline[i] === opts.after )
					{
						
					}
				}
			} else {
			//	add onto the end
				pipeline.push( func );
			}

		//	pipeline has changed, recompile
			compilePipeline();
		}

	,	removeAdvice:function( name ){
			compilePipeline();
		}

	,	augmentArray:function( name ){

			name = name || 'toElement';

			Array.prototype[name] = function(){
				return JSON_BUILD.build( this );
			}
		}
	}; // end JSON_BUILD


	function buildCore( proceed, obj, parent_array ) {

		var i, out;

	//	empty arrays create empty document fragements:
		if( !obj.tagName ){
			out = document.createDocumentFragment();
		} else {
			out = document.createElementById( obj.tagName );

			for( i in obj.attributes ) {
				out.setAttribute( obj.attributes[i] );
			}
		}

		for( i = 0; i < obj.children.length; i++ ) {
			out.appendChild( JSON_BUILD.build( obj.children[i] ) );
		}
	} // end buildCore
	
//	looks for callbacks, executes any that are found 
	function callback_advice( proceed, obj, parent_array )
	{
	} // end of callback_advice

/*	eg:
		{jb-class:'orange-{firstlast} {evenodd}}
		{jb:{'class':orange-{childno}} 			 */		
/*		why not just:
			class:'orange {first? orange-first} {last? orange-last} {even-odd}'

			like the above better than the below. More flexible wrt class names,
			doesn't have to exclude the 'orange-' bit OUTSIDE the brackets.

			class:'orange orange-{first-child} orange-{last-child} {even-odd}'
		eg, stuff in curly braces gets evaluated in classes?
				this would never be in a class becuase interferes with
				css rules (eg, end of the selector, start of the declartion block)
				this is considerably better!	

		How about class:'foo-{hover? hover}' ?		*/
//		requires parent elements
	function pseudoattribute_advice( proceed, obj, parent_array ){
		return proceed( obj, array, parent_array );
	} // end pseudoattribute_advice

	function class_combine_advice( proceed, obj, parent_array ){
		return proceed( obj, array, parent_array );
	} // end class_combine_advice


/*	Should be done pre-gathering, Unless gathering knows how to handle multiple
	values for same attribute name? Eg, could be more than one style set. Hmmm.

	Perhaps gathering should do something special. Like making arrays where the same
	value is set twice? Eg: {style:[{backgroundColor:red},{borderColor:blue}]
	Or, say, setting style:fdfad style2:dfdasf style3:dafda	

	should allow attributes like 'style/backgroundColor' or {'style/display':'none'} */
	function style_advice( proceed, obj, parent_array ){
		
		var i = array.length
		,	v;

		while( i-- )
		{
			if( array[i].constructor === Object )
			{				
				for( k in array[i] )
				{	
					v = array[i][k];
				}
			}
		}
	} // end style_advice


/*	aliases are: notify, listen, events, on
		eg: {on:{click:function(){}, mouseover:function(){}}}
	read pre-proceed and add to element post-proceed */
	function listener_advice( proceed, obj, parent_array ) {
		var k, ele, events;

		for( k in obj.attributes ){
		//	gather into events, delete
		}

		ele = proceed( obj );

		for( k in events ){
			listento( ele, k, events[k] );
		}
	}

	function pseudoattribute_advice( proceed, obj, parent_array ){
	} // end pseudoattribute_advice

/*	allows attributes to be specified with a slash or dot. Eg:
		{'style/backgroundColor':'red'} and {'notify.click':function(){alert('click')} }		
	are transformed into:
		{'style':{backgroundColor:'red'}} and {'notify':{'click':function(){alert('click')}}}  */
	function hierarchyAttribute_advice( proceed, obj, parent_array ) {
		var k, v, 
			bits;

		for( k in obj.attributes ){
			if( k.indexOf( /[\/\.]/ ) != -1 ){
				v = obj.attributes[k];

				bits.split( /[\/\.]/ , 2); // get before, after the / or .
				
				obj[ bits[0] ].push( {bits[1]:v} );
			}
		}
	} // end hierarchyAttribute_advice


/*	allows two attributes to be specified at once. Eg:
		{event:{ 'click|keypress':function f(){} }}
	is transformed to:
		function f(){}; {event:{ click:f, keypress:f }} 	*/
	function multipleAttribute_advice( proceed, obj, parent_array ){
	}


/*	One attr per element can be set in the tagName. For when having a
	hash would be more typing. Eg: 

		[#addr-field, ['label[for=addr]'], ['input#addr] ] 	*/
	function singleAttrCss_advice( proceed, obj, parent_array ){
		
		var pattern = /blah blah/;

		return proceed( obj, parent_array );
	} // end singleAttrCss_advice

	function cssClassId_advice( proceed, obj, parent_array ) {

		var pattern = /(^|\.\w[\w\d-]*|#[\w\d-]+)/g
		,	cssBits = obj.tagName.match( pattern );

	//	may have found no matches, in which case skip this bit:
		if( !cssBits )
			return proceed( obj, parent_array );

		var	tagName
		,	id = ''
		,	classes = [];
	
		cssBits.each( function( bit ){
			switch( bit.charAt(0) ){
				case '.':
					classes.push( bit.substr(1) );
					break;
				case '#':
					id = bit.substr(1);
					break;
				default:				
					tagName = bit;
					break;
			}
		});

		/*	Need to somehow get the bit that wasn't matched above and set 
			as tagName. Hmmm. */
		
		if( id )
			obj.attributes.id = id;

		if( classes.length ){

			classes = classes.join(' ');
			if( !obj.attributes.class ) {
				obj.attributes.class = [classes];
			}else {
				obj.attributes.class.push( classes );
			}
		}
		
		return proceed( obj, parent_array );
	} // end cssClassId_advice
	

	function firstTextnode_advice( proceed, obj, parent_array ){

		var splited = obj.split( /\w/, 2 );
		if( splited.length > 1 ) {	
			obj.tagName = splited[0];
		/*	add to start of children string with trailing space removed */
			obj.children.unshift( splited[1].replace(/^\s+/, '') );
		}
	}

/*	Allows tagName to be specified as:
		'=orange span.foo'
	or	{'jb-assign':orange}

	The idea is this would be somehow used to assign to variable
	orange somewhere. Not certain how this works, maybe pass
	an object into toElement which gets populated?

	to create three of a tagname. This works because a tagName
	cannot start with a space */
	function assignment_advice( proceed, obj, parent_array ){
		return proceed( obj, parent_array );
	}

/*	Allows tagName to be specified as:
		'span.bar+span.foo'
	to create two sibblings at once.
		WHere do contents/attributes go?! */
	function siblings_advice( proceed, obj, parent_array ){
		var hit, i, rtn;

		if( hit = /^(\d+)\*(.*)/.exec(obj.tagName) )
		{
			rtn = document.createDocumentFragment();

			obj.tagName = hit[2];

			i = hit[1]; // the number
			while( i-- )
			{	rtn.appendChild( proceed( obj, parent_array ) );
			}
			return rtn;
		}

		return proceed( obj, parent_array );
	}

/*	Allows tagName to be specified as:
		'3*span.foo'

	Usable with callbacks. Eg:
		['3*div.person', JSON_BUILD.iter( [ 'alison',  'bob', 'ivan' ] ) ];		
		['50*div.color', {'style/backgroundColor': function(){ return random colour() }} ];
		['50*div.color', function( something ){ return colour related to something };

	to create three of a tagname. This works because a tagName
	cannot start with a number */
	function multiple_advice( proceed, obj, parent_array ){
		var hit, i, rtn;

		if( hit = /^(\d+)\*(.*)/.exec(obj.tagName) )
		{
			rtn = document.createDocumentFragment();

			obj.tagName = hit[2];

			i = hit[1]; // the number
			while( i-- )
			{	rtn.appendChild( proceed( obj, parent_array ) );
			}
			return rtn;
		}

		return proceed( obj, parent_array );
	}

/*	Allows tagNames to be specified as:
		'#foo/span.bar' (dir syntax)
	or	'#foo>span.bar' (css syntax)  */
	function wrapper_advice( proceed, obj, parent_array ){

		if( array[0].constructor !== String ){
			return array;
		}

		var specs = obj.array[0].split( '/' );

		if( specs.length > 1 ){

			for( var i = 0; i< specs.length; i++ )			
				array = [ specs[i], array ];
		}

		return proceed( array );
	}

	//	Allows the elements of the array to be specified in any order, without the
	//	next steps having to be aware of this. Output is an object with properties:
	//		children: 	array of children
	//		attributes: object of attributes
	//		tagName
	//	where collisions on attributes, what to do?
	//		Perhaps some kind of Combine? Eg, 
	//			arrays 	=> concat
	//			String 	=> space sep, 
	//			Objects => merge
	//	combinations of more than one type? Eg, style can be string *and* object
	//		array + string 	- add string to array
	//		array + object 	- ?
	//		string + object - ?
	//
 	//	another way might be to look at this as implementing a list (not set) of values.
	//	in practice, would use numbers (eg style, style2, style3) but conceptually,
	//	multiple mappings per key
	//		this has few (no) advantages over auto-arraying
	//			actually, has advantage that can distinguish between key mapping to 
	//			values and multiple mappings for same key
	//
	//	Alternatively, all attributes could be stored in arrays, regardless of if
	//	needed or not. Slow but makes things simper. Can traverse.
	//		{style:[{backgroundColor:'red'},'borderColor:green']}

/*	Since this is a special case, perhaps it could be built into 
	JSON_BUILD.toElement() ? 

	No, that wouldn't allow us to add features pre-gather */
	function gather_advice( proceed, array, parent_obj ){
		var i = array.length, j
		, 	cur
		,	out = 	{	children	:[]
					,	attributes	:{}
					};

		if( String === array[0].constructor ) {
		out.name = array[0]; 
		}

		while( i-- >= 1 ){	

			cur = array[i];

			switch( cur.constructor ) {
				case Array:
					for( var j = 0; j < cur.length; j++ )
					{	out.children.push( cur[ j ] );						
					}
					break;

				case Object:

					for( var j in cur )
					{
					//	out.children. = cur[ j ];
					} 
					break;
			}
		}
		
		return proceed( out, parent_obj );
	}


	return JSON_BUILD;
}());