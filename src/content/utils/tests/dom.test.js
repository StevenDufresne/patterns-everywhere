const { parseHTML } = require( 'linkedom' );
import { getStylesString, getElementStyles } from '../dom';

describe( 'Style formatting', function () {
	test( 'Convert styles object to a string', () => {
		const styles = {
			color: 'red',
			'background-color': 'blue',
		};

		const result = getStylesString( styles );

		expect( result ).toBe( 'color:red;background-color:blue' );
	} );
} );

// describe( 'getElementStyles', () => {
// 	let computedStylesMock, document;

// 	beforeEach( () => {
// 		// Setup DOM using LinkeDOM
// 		const { document: doc } = parseHTML(`<div id="parent"><div id="child"></div></div>`);
// 		document = doc;
// 		element = document.getElementById('parent');

// 		computedStylesMock = {
// 			getPropertyValue: jest.fn( ( prop ) => {
// 				const styles = {
// 					color: 'red',
// 					'font-size': '16px',
// 					margin: '10px',
// 				};
// 				return styles[ prop ];
// 			} ),
// 			// Simulate the iteration behavior of the `computedStyles` object
// 			[ Symbol.iterator ]: function* () {
// 				yield 'color';
// 				yield 'font-size';
// 				yield 'margin';
// 			},
// 		};
// 	} );

// 	it( 'should filter and return only supported properties', () => {
// 		const supportedProperties = [ 'color', 'font-size' ];
// 		const result = getElementStyles(
// 			computedStylesMock,
// 			supportedProperties,
// 			document
// 		);

// 		expect( result ).toEqual( {
// 			color: 'red',
// 			'font-size': '16px',
// 		} );

// 		expect( computedStylesMock.getPropertyValue ).toHaveBeenCalledWith(
// 			'color'
// 		);
// 		expect( computedStylesMock.getPropertyValue ).toHaveBeenCalledWith(
// 			'font-size'
// 		);
// 		expect( computedStylesMock.getPropertyValue ).not.toHaveBeenCalledWith(
// 			'margin'
// 		);
// 	} );

// 	it( 'should return an empty object if no supported properties are found', () => {
// 		const supportedProperties = [ 'padding', 'border' ];
// 		const result = getElementStyles(
// 			computedStylesMock,
// 			supportedProperties
// 		);

// 		expect( result ).toEqual( {} );
// 		expect( computedStylesMock.getPropertyValue ).not.toHaveBeenCalled();
// 	} );
// } );
