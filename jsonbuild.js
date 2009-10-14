

/** "Most usage requires you to use just one function.
*/

var JSON_BUILD = (function(){


/*	first, a few non-prototype-augmenting (functional rather than OOP) versions of 
	functions from Prototype */
	function update(array, args) { //internal function from Prototype's Function.prototype code
		var arrayLength = array.length, length = args.length;
		while (length--) array[arrayLength + length] = args[length];
		return array;
	}
/*	This wrap is purely functional - that is, it doesn't care about this and makes
	no attempt at binding. Once wrapped, all scope is lost. */
	function wrapFrunction(wrappee, wrapper) {
		return function() {
			var a = update(wrappee, arguments);
			return wrapper.apply( null , a);
		}
	}

		
//	stores all the stages	
	var advisors = 	{ 	BUILD: build 
					,	PSEUDO_ATTRIBUTE: pseudoattribute_advice
					,	STYLES: style_advice
					,	GATHER: gather_advice }

	,	pipeline = 	[ 	gather_advice, wrapper_advice, multiple_advice, assignment_advice, 
						firstTextnode_advice, css_syntax_advice, hierarchyAttribute_advice, 
						listener_advice, style_advice, class_combine_advice, pseudoattribute_advice, 
						build ];

//	assigns pipeline.call to a function to call all advisors. 
//	From end of array (outside) to start (innermost) and back out again.
	pipeline.compile = function(){
	//	start with the innermost frame (frame zero)
		pipeline.call = impl( 0 );

		function impl( i ){

			var frame = pipeline[ i ];
		//	Outermost frame. Return an identity function.

			if( i == pipeline.length-1 ) {
				return frame;
			} else {				
			//	return this frame wrapped in the next frame
				return wrapFunction( frame, impl( i++ ) );
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

	,	advisors:advisors

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
	};


	function build( proceed, obj ){
	//	empty arrays create empty document fragements:
		if( 0 === a.length )
		{	return document.createDocumentFragment();
		}

		var out = document.createElementById( obj.tagName );
		
	}

/*	eg:
		{jb-class:'orange-{firstlast} {evenodd}}
		{jb:{'class':orange-{childno}} 			 */		
//		requires parent elements
	function pseudoattribute_advice( array, parent_array ){
	}

	function class_combine_advice( array )
	{
	}


/*	Should be done pre-gathering, Unless gathering knows how to handle multiple
	values for same attribute name? Eg, could be more than one style set. Hmmm.

	Perhaps gathering should do something special. Like making arrays where the same
	value is set twice? Eg: {style:[{backgroundColor:red},{borderColor:blue}]
	Or, say, setting style:fdfad style2:dfdasf style3:dafda	

	should allow attributes like 'style/backgroundColor' or {'style/display':'none'} */
	function style_advice( array ){
		
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
	}


/*	aliases are: notify, listen, events, on
		eg: {on:{click:function(){}, mouseover:function(){}}}
	read pre-proceed and add to element post-proceed */
	function listener_advice( proceed, obj ) {
		var k, ele, events;

		for( k in obj.attributes ){
		//	gather into events, delete
		}

		ele = proceed( obj );

		for( k in events ){
			listento( ele, k, events[k] );
		}
	}


/*	allows attributes to be specified with a slash. Eg:
		{'style/backgroundColor':'red'} and {'notify/click':function(){alert('click')} }
	are transformed into:
		{'style':{backgroundColor:'red'}} and {'notify':{'click':function(){alert('click')}}}  */
	function hierarchyAttribute_advice( obj ) {
		var k, v, 
			bits;

		for( k in obj.attributes ){
			if( k.indexOf( '/' ) != -1 ){
				v = obj.attributes[k];

				bits.split('/', 2);
				
				obj[ bits[0] ].push( {bits[1]:v} );
			}
		}
	}


	function css_syntax_advice( obj ) {
		if( !Object.isString( jml[0] ) )
			return proceed( jml );

		var pattern = /(^\w[\w\d-_]*|\.\w[\w\d-]*|#[\w\d-]+)/g
		,	css_bits = jml[0].match( pattern );

	//	may have found no matches, in which case skip this bit:
		if( !css_bits )
			return proceed( jml );					

		var	tag_name = 'div' //div is the default tag name
		,	id = ''
		,	classes = []
		,	attrs = {};
	
		css_bits.each( function( bit )
		{
			switch( bit.charAt(0) )
			{	case '.':
					classes.push( bit.substr(1) );
					break;
				case '#':
					id = bit.substr(1);
					break;
				default:				
					tag_name = bit;						
					break;
			}
		});
		
		if( id )
			attrs.id = id;
		if( classes.length > 0 )
			attrs['class'] = classes.join(' '); //array notation - class is reserved word
		
		jml[0] = tag_name;
		jml.push( attrs );

		return array;
	}
	

	function firstTextnode_advice( obj ){

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
	function assignment_advice( array, proceed ){
	}

/*	Allows tagName to be specified as:
		'3x span.foo'
	to create three of a tagname. This works because a tagName
	cannot start with a number */
	function multiple_advice( array, proceed ){
	}

/*	Allows tagNames to be specified as:
		'#foo/span.bar' */
	function wrapper_advice( array, proceed ){

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
	function gather_advice( array ){
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
		
		return out;
	}


	return JSON_BUILD;
}());