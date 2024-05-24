// Example usage

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
	],
};

const jsonString = JSON.stringify( blueprint );
const base64String = btoa( jsonString );
const url = `https://playground.wordpress.net/#${ base64String }`;
const iframe = document.createElement( 'iframe' );
iframe.id = 'iframe-playground';
iframe.src = url;
document.body.appendChild( iframe );
