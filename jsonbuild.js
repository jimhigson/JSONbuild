var JSON_BUILD = function(){

	var interceptors = [];

/*	mask the global variable */
	var JSON_BUILD = {
		build:function( a ){

		//	empty arrays create empty document fragements:
			if( 0 === a.length )
			{	return document.createDocumentFragment();
			}			
		}

	,	add_interceptor:function( i ){

			this.build = function(){
				i.call( $A() );
			};
		}
	};


//	allow the elements of the array to be specified in any order by 
//	this normalisation step:
	function normalize_interceptor( proceed, array ){

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

	function css_syntax_interceptor( proceed, array )
	{
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
		
		return proceed( jml );
	}

/*	order to be performed: 
		NORMALISE
		CSS SELS
		STYLES
		EVENTS - be selective based on libraries installed */

	JSON_BUILD.add_interceptor( css_syntax_interceptor );
	JSON_BUILD.add_interceptor( normalize_interceptor );

	if( !something )
	{	Array.prototype.toElement = 
	}

	return JSON_BUILD;
};