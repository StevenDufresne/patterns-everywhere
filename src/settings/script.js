/* global chrome */

const plugin = `
<?php
/*
* Plugin Name: Injector
* Description: Injects the transform.
* Version: 1.0
* Author: Your Name
*/

function my_gutenberg_block_register_block() {
	// Register the block script
	wp_register_script(
		'my-gutenberg-block-editor-script',
		plugins_url( 'block.js', __FILE__ ),
		array( 'wp-blocks', 'wp-element', 'wp-editor', 'wp-hooks', 'wp-components', 'wp-i18n' ),
		null
	);

	// Register the block
	register_block_type( 'my-plugin/my-gutenberg-block', array(
		'editor_script' => 'my-gutenberg-block-editor-script',
	) );
}

add_action( 'init', 'my_gutenberg_block_register_block' );
`.trim();

fetch( chrome.runtime.getURL( 'build/wp-plugin/index.js' ) )
	.then( ( response ) => response.text() )
	.then( ( data ) => {
		const block = data.trim();

		const blueprint = {
			$schema: 'https://playground.wordpress.net/blueprint-schema.json',
			login: true,
			landingPage: '/wp-admin/post-new.php',
			steps: [
				{
					step: 'installPlugin',
					pluginZipFile: {
						resource: 'url',
						url: 'https://raw.githubusercontent.com/StevenDufresne/patterns-everywhere/trunk/gutenberg_fix.zip',
					},
				},
				{
					step: 'mkdir',
					path: '/wordpress/wp-content/plugins/injector',
				},
				{
					step: 'writeFile',
					path: '/wordpress/wp-content/plugins/injector/block.js',
					data: block,
				},
				{
					step: 'writeFile',
					path: '/wordpress/wp-content/plugins/injector/injector.php',
					data: plugin,
				},
				{
					step: 'activatePlugin',
					pluginName: 'Injector',
					pluginPath: '/wordpress/wp-content/plugins/injector',
				},
			],
		};

		const jsonString = JSON.stringify( blueprint );
		const base64String = btoa( jsonString );
		const url = `https://playground.wordpress.net/#${ base64String }`;
		const iframe = document.createElement( 'iframe' );
		iframe.id = 'iframe-playground';
		iframe.src = url;
		document.body.appendChild( iframe );
	} )
	.catch( ( error ) => {
		// eslint-disable-next-line no-console
		console.error( 'Error fetching JavaScript file:', error );
	} );
