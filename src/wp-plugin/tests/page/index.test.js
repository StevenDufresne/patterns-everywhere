const fs = require( 'fs' );
const path = require( 'path' );
const { JSDOM } = require( 'jsdom' );
const mhtml2html = require( 'mhtml2html' );
import { registerCoreBlocks } from '@wordpress/block-library';
import { recurseDOM } from '../../index';

beforeAll( () => {
	registerCoreBlocks();
} );

describe( 'Google', () => {
	beforeAll( async () => {
		await page.goto( 'https://google.com' );
	} );

	it.skip( 'should be titled "Google"', async () => {
		await expect( page.title() ).resolves.toMatch( 'Google' );
	} );
} );

// describe( 'UI tests', () => {
// 	const folderPath = path.join( __dirname, 'assets' );
// 	let htmlFiles;

// 	beforeAll( async () => {
// 		// Read the contents of the folder

// 		const files = await fs.promises.readdir( folderPath );

// 		htmlFiles = files.filter(
// 			( file ) => path.extname( file ) === '.mhtml'
// 		);
// 	} );

// 	test( 'Example test', async () => {
// 		// Loop through HTML files
// 		for ( const file of htmlFiles ) {
// 			const filePath = path.join( folderPath, file );

// 			// Read HTML content
// 			const htmlContent = await fs.promises.readFile( filePath, 'utf8' );
// 			// Convert MHTML to HTML
// 			const htmlDoc = mhtml2html.convert( htmlContent, {
// 				parseDOM: ( html ) => new JSDOM( html ),
// 			} );

// 			const result = recurseDOM(
// 				htmlDoc.window.document.body.querySelector( '.wp-site-blocks' )
// 			);

// 			console.log( JSON.stringify(result) );
// 		}
// 	} );
// } );

// Run the function with the folder path
