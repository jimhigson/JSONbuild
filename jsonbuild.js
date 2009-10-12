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
	,	pipeline = 	[ build, pseudoattribute_advice, style_advice, gather_advice ];

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

	function pseudoattribute_advice( array, parent_array ){
	}

	function css_syntax_advice( array ) {
		if( !Object.isString( jml[0] ) )
			return proceed( jml );

		var pattern = /(^[\w\d-_]+|\.[\w\d-]+|#[\w\d-]+)/g
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

	function class_combin_advice( array )
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

	//	Allows the elements of the array to be specified in any order, without the
	//	next steps having to be aware of this. Output is an object with properties:
	//		children: 	array of children
	//		attributes: object of attributes
	//		tagName
	function gather_advice( array ){
		var i = array.length, j
		, 	cur
		,	out = 	{	children	:[]
					,	attributes	:{}
					};

		if( String === array[0].constructor )
		{	out.name = array[0]; 
		}

		while( i-- >= 1 )
		{	
			cur = array[i];

			switch( cur.constructor )
			{	case Array:
					for( var j = 0; j < cur.length; j++ )
					{	out.children.push( cur[ j ] );						
					}
					break;
				case Object:

					for( var j in cur )
					{
						out.children = cur[  ];
					} 
					break;
			}
		}
		
		return out;
	}

	return JSON_BUILD;
}());