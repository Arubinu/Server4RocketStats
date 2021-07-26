'use strict';

const	fs			= require( 'fs' ),
		http		= require( 'http' ),
		path		= require( 'path' ),
		express		= require( 'express' ),
		socketIO	= require( 'socket.io' ),
		bodyParser	= require( 'body-parser' );

const	app			= express(),
		server		= http.Server( app ),
		io			= socketIO( server );

process.on( 'SIGINT', () => {
	io.close();
	server.close();

	process.exit();
} );

fs.readFile( path.join( __dirname, 'config.json' ), 'utf8', ( err, data ) => {
	if ( err )
		return ( console.error( err, '\n', 'The configuration file is missing !' ) );

	let config;
	try
	{
		config = JSON.parse( data );
	}
	catch ( err )
	{
		return ( console.error( 'The configuration file is wrong !' ) );
	}

	if ( !config.rocketstats_path || typeof( config.rocketstats_path ) !== 'string' )
		config.rocketstats_path = '%appdata%\\bakkesmod\\bakkesmod\\RocketStats';
	config.rocketstats_path = config.rocketstats_path.replace( /%([^%]+)%/g, ( _ , key ) => process.env[ key ] );
	config.overlay_path = path.join( config.rocketstats_path, 'RocketStats_overlay' );
	config.images_path = path.join( config.rocketstats_path, 'RocketStats_images' );

	if ( !fs.existsSync( config.overlay_path ) )
		return ( console.error( 'You must install Overlay4Rocketstats for the server to launch !' ) );

	config.files = {};
	const updateFile = ( file, callback ) => {
		fs.readFile( file, 'utf8', ( err, data ) => {
			let name = path.parse( file ).name;
			let is_undefined = ( typeof( config.files[ name ] ) === 'undefined' );
			let previous = ( is_undefined ? '' : config.files[ name ] );

			if ( err && is_undefined )
				config.files[ name ] = '';
			else if ( !err && ( is_undefined || ( !is_undefined && data.trim() != config.files[ name ] ) ) )
				config.files[ name ] = data.trim();
			else
				return ;

			if ( callback )
				callback( name, config.files[ name ] )
		} );
	};

	fs.readdir( config.rocketstats_path, ( err, files ) => {
		for ( let file of files )
		{
			let name = path.basename( file );
			if ( name.indexOf( 'RocketStats_' ) || name.slice( -4 ) != '.txt' )
				continue ;

			file = path.join( config.rocketstats_path, file );

			updateFile( file );
			fs.watchFile( file, { interval: config.delay }, ( current, previous ) => {
				updateFile( file, ( name, content ) => {
					console.log( `Update ${name}:`, content );
					io.sockets.emit( 'file', { name: name, content: content } );
				} );
			} );
		}
	} );

	setTimeout( () => {
		console.log( config, '\n' );
	}, 1000 );

	app.use( bodyParser.json() );
	app.use( bodyParser.urlencoded( { extended: true } ) );
	app.use( express.static( config.overlay_path ) );
	app.get( '/', ( req, res ) => { res.sendFile( 'overlay.html', { root: config.overlay_path } ); } );
	app.get( '/RocketStats_images/:file', ( req, res ) => { res.sendFile( path.join( config.images_path, req.params.file ) ); } );

	io.on( 'connection', socket => {
		console.log( `Client connection: ${socket.id}` );

		socket.on( 'disconnection', () => {
			console.log( `Client disconnection: ${socket.id}` );
		} );

		socket.emit( 'files', config.files );
	} );

	server.on( 'error', error => {
		if ( error.toString().indexOf( 'EADDRINUSE' ) >= 0 )
			error = `Port ${config.port} is used`;

		console.error( error );
		process.exit( -1 );
	} );

	server.listen( config.port, () => {
		console.log( `Server started on port ${config.port}` );
	} );
} );
