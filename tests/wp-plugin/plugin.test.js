import { registerCoreBlocks } from '@wordpress/block-library';
import { recurseDOM } from '../../src/wp-plugin/index';

const { JSDOM } = require( 'jsdom' );

const WPSVG =
	'<svg xmlns="http://www.w3.org/2000/svg" role="img" width="28" height="28" viewBox="0 0 28 28"><path fill="currentColor" d="M13.6052 0.923525C16.1432 0.923525 18.6137 1.67953 20.7062 3.09703C22.7447 4.47403 24.3512 6.41803 25.3097 8.68603C26.9837 12.6415 26.5382 17.164 24.1352 20.7145C22.7582 22.753 20.8142 24.3595 18.5462 25.318C14.5907 26.992 10.0682 26.5465 6.51772 24.1435C4.47922 22.7665 2.87272 20.8225 1.91422 18.5545C0.240225 14.599 0.685725 10.0765 3.08872 6.52603C4.46572 4.48753 6.40973 2.88103 8.67772 1.92253C10.2302 1.26103 11.9177 0.923525 13.6052 0.923525ZM13.6052 0.113525C6.15322 0.113525 0.105225 6.16153 0.105225 13.6135C0.105225 21.0655 6.15322 27.1135 13.6052 27.1135C21.0572 27.1135 27.1052 21.0655 27.1052 13.6135C27.1052 6.16153 21.0572 0.113525 13.6052 0.113525Z"></path><path fill="currentColor" d="M2.36011 13.6133C2.36011 17.9198 4.81711 21.8618 8.70511 23.7383L3.33211 9.03684C2.68411 10.4813 2.36011 12.0338 2.36011 13.6133ZM21.2061 13.0463C21.2061 11.6558 20.7066 10.6973 20.2746 9.94134C19.8426 9.18534 19.1676 8.22684 19.1676 7.30884C19.1676 6.39084 19.9506 5.31084 21.0576 5.31084H21.2061C16.6296 1.11234 9.51511 1.42284 5.31661 6.01284C4.91161 6.45834 4.53361 6.93084 4.20961 7.43034H4.93861C6.11311 7.43034 7.93561 7.28184 7.93561 7.28184C8.54311 7.24134 8.61061 8.13234 8.00311 8.21334C8.00311 8.21334 7.39561 8.28084 6.72061 8.32134L10.8111 20.5118L13.2681 13.1273L11.5131 8.32134C10.9056 8.28084 10.3386 8.21334 10.3386 8.21334C9.73111 8.17284 9.79861 7.25484 10.4061 7.28184C10.4061 7.28184 12.2691 7.43034 13.3626 7.43034C14.4561 7.43034 16.3596 7.28184 16.3596 7.28184C16.9671 7.24134 17.0346 8.13234 16.4271 8.21334C16.4271 8.21334 15.8196 8.28084 15.1446 8.32134L19.2081 20.4173L20.3691 16.7453C20.8821 15.1388 21.1926 14.0048 21.1926 13.0328L21.2061 13.0463ZM13.7946 14.5853L10.4196 24.3998C12.6876 25.0613 15.1041 25.0073 17.3316 24.2243L17.2506 24.0758L13.7946 14.5853ZM23.4741 8.21334C23.5281 8.59134 23.5551 8.98284 23.5551 9.37434C23.5551 10.5218 23.3391 11.8043 22.7046 13.3973L19.2621 23.3333C24.5271 20.2688 26.4036 13.5593 23.4741 8.21334Z"></path></svg>';

beforeAll( () => {
	registerCoreBlocks();
} );

describe( 'General tests', () => {
	it( 'Should return false if empty', () => {
		const { window } = new JSDOM( '<div></div>' );
		const result = recurseDOM( window.document.body.firstChild );
		expect( result ).toBe( false );
	} );

	it( 'Should return with the correct inner block', () => {
		const html = '<div><h1>Heading</h1></div>';
		const { window } = new JSDOM( html );
		const result = recurseDOM( window.document.body.firstChild );

		expect( result.innerBlocks[ 0 ].name ).toBe( 'core/heading' );
	} );

	it( 'Should apply correct display styles', () => {
		const html =
			'<div style="display:flex;background:red;padding-left:10px"><h1>Heading</h1></div>';
		const { window } = new JSDOM( html );
		const result = recurseDOM( window.document.body.firstChild );

		expect( result.attributes.layout.type ).toBe( 'flex' );
		expect( result.attributes.style.color.background ).toBe( 'red' );
		expect( result.attributes.style.spacing.padding.left ).toBe( '10px' );
	} );

	it( 'Should not apply unsupported style', () => {
		const html =
			'<div style="white-space-collapse:preserve"><h1>Heading</h1></div>';
		const { window } = new JSDOM( html );
		const result = recurseDOM( window.document.body.firstChild );

		expect(
			JSON.stringify( result.attributes.style ).includes(
				'white-space-collapse'
			)
		).toBe( false );
	} );

	it( 'Should return html block for SVG', () => {
		const html = `<div>${ WPSVG }</div>`;
		const { window } = new JSDOM( html );
		const result = recurseDOM( window.document.body.firstChild );

		expect( result.innerBlocks[ 0 ].name ).toBe( 'core/html' );
	} );

	it( 'Should return core/paragraph when no transform found', () => {
		const html = `<div><custom>Something</custom></div>`;
		const { window } = new JSDOM( html );
		const result = recurseDOM( window.document.body.firstChild );

		expect( result.innerBlocks[ 0 ].name ).toBe( 'core/paragraph' );
	} );

	it( 'Should not return an empty core/group', () => {
		const html = `<div><h2>Heading</h2><div></div></div>`;
		const { window } = new JSDOM( html );
		const result = recurseDOM( window.document.body.firstChild );

		expect( result.innerBlocks.length ).toBe( 1 );
	} );

	it( 'Should return core/group blocks for ul, li with inner content', () => {
		const html = `<div><ul><li><h3>Title</h3><p>Content</p></li></ul></div>`;
		const { window } = new JSDOM( html );
		const result = recurseDOM( window.document.body.firstChild );

		expect( result.innerBlocks[ 0 ].name ).toBe( 'core/group' );
		expect( result.innerBlocks[ 0 ].innerBlocks[ 0 ].name ).toBe(
			'core/group'
		);
		expect(
			result.innerBlocks[ 0 ].innerBlocks[ 0 ].innerBlocks[ 0 ].name
		).toBe( 'core/heading' );
		expect(
			result.innerBlocks[ 0 ].innerBlocks[ 0 ].innerBlocks[ 1 ].name
		).toBe( 'core/paragraph' );
	} );

	it( 'Should return core/group blocks for ul, li', () => {
		const html = `<div><ul style="line-height:1.75;padding-left:16px"><li>A world of thought-provoking articles.</li></ul></div>`;
		const { window } = new JSDOM( html );
		const result = recurseDOM( window.document.body.firstChild );

		const ul = result.innerBlocks[ 0 ];
		const li = ul.innerBlocks[ 0 ];
		const paragraph = li.innerBlocks[ 0 ];

		expect( paragraph.name ).toBe( 'core/paragraph' );
	} );

	it( 'Should return a core/paragraph for an a tag that wrap elements', () => {
		const html = `<div><a href="//wp.org"><h3>Title</h3><p>Content</p></a></div>`;
		const { window } = new JSDOM( html );
		const result = recurseDOM( window.document.body.firstChild );

		expect( result.innerBlocks[ 0 ].name ).toBe( 'core/paragraph' );
	} );
} );

describe( 'Heading', () => {
	it( 'Should apply alignment', () => {
		const html = `<div><h3 style="color:red;text-align:center;">Title</h3></div>`;
		const { window } = new JSDOM( html );
		const result = recurseDOM( window.document.body.firstChild );

		const { attributes } = result.innerBlocks[ 0 ];
		expect( attributes.textAlign ).toBe( 'center' );
	} );

	it( 'Should apply font-size', () => {
		const html = `<div><h3 style="font-size:12px;">Title</h3></div>`;
		const { window } = new JSDOM( html );
		const result = recurseDOM( window.document.body.firstChild );

		const { attributes } = result.innerBlocks[ 0 ];
		expect( attributes.style.typography.fontSize ).toBe( '12px' );
	} );
} );

describe( 'Button', () => {
	it( 'Should return a core/buttons for an a button-like element', () => {
		const html = `<div><a class="button">Submit</a><a class="btn">Submit</a><a>Submit</a></div>`;
		const { window } = new JSDOM( html );
		const result = recurseDOM( window.document.body.firstChild );

		// Anchor #1
		expect( result.innerBlocks[ 0 ].name ).toBe( 'core/buttons' );
		expect( result.innerBlocks[ 0 ].innerBlocks[ 0 ].name ).toBe(
			'core/button'
		);
		expect(
			result.innerBlocks[ 0 ].innerBlocks[ 0 ].attributes.text
		).toBeDefined();

		// Anchor #2
		expect( result.innerBlocks[ 1 ].name ).toBe( 'core/buttons' );
		expect( result.innerBlocks[ 1 ].innerBlocks[ 0 ].name ).toBe(
			'core/button'
		);

		// Anchor #3
		expect( result.innerBlocks[ 2 ].name ).toBe( 'core/paragraph' );
	} );

	it( 'Should return a core/buttons for an a button-like element wrapped by <p>', () => {
		const html = `<div><p><a class="button">Submit</a></p></div>`;
		const { window } = new JSDOM( html );
		const result = recurseDOM( window.document.body.firstChild );

		expect( result.innerBlocks[ 0 ].name ).toBe( 'core/buttons' );
		expect( result.innerBlocks[ 0 ].innerBlocks[ 0 ].name ).toBe(
			'core/button'
		);
	} );

	it( 'Should set button href', () => {
		const html = `<div><a href="//wp.org" class="button">Submit</a></div>`;
		const { window } = new JSDOM( html );
		const result = recurseDOM( window.document.body.firstChild );

		expect( result.innerBlocks[ 0 ].innerBlocks[ 0 ].name ).toBe(
			'core/button'
		);
	} );
} );

describe( 'Pre/Code', () => {
	it( 'Should return code block', () => {
		const html = `<div><pre><code>registerBlockType( 'your-first-block/hello-world', {
			edit: function () {
				return &lt;p&gt;Hello world (from the editor)&lt;/p&gt;;
			},
			save: function () {
				return &lt;p&gt;Hello world (from the frontend)&lt;/p&gt;;
			},
		} );</code></pre></div>`;
		const { window } = new JSDOM( html );
		const result = recurseDOM( window.document.body.firstChild );

		expect( result.innerBlocks[ 0 ].name ).toBe( 'core/code' );
	} );
} );

describe( 'Figure/Image', () => {
	it( 'Should return core/image block', () => {
		const html = `<div><img src="//wp.org/test.png" alt="alt-text"></div>`;
		const { window } = new JSDOM( html );
		const result = recurseDOM( window.document.body.firstChild );

		expect( result.innerBlocks[ 0 ].name ).toBe( 'core/image' );
		expect( result.innerBlocks[ 0 ].attributes.url ).toBe(
			'//wp.org/test.png'
		);
		expect( result.innerBlocks[ 0 ].attributes.alt ).toBe( 'alt-text' );
	} );

	// This isn't ideal we probably don't want to add an extra group but it keeps the code simple.
	it( 'Should return core/group block for <figure>', () => {
		const html = `<div><figure><img src="//wp.org/test.png"></figure></div>`;
		const { window } = new JSDOM( html );
		const result = recurseDOM( window.document.body.firstChild );

		expect( result.innerBlocks[ 0 ].name ).toBe( 'core/group' );
	} );

	it( 'Should apply styles', () => {
		const html = `<div><img style="border-right-width:1px;border-right-color:red;" src="//wp.org/test.png"></div>`;
		const { window } = new JSDOM( html );
		const result = recurseDOM( window.document.body.firstChild );

		expect(
			result.innerBlocks[ 0 ].attributes.style.border.right.width
		).toBe( '1px' );
		expect(
			result.innerBlocks[ 0 ].attributes.style.border.right.color
		).toBe( 'red' );
	} );
} );
