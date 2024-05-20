import {
	getStylesString,
	getFilteredExistingStyles,
	removeDataAttributes,
} from '../dom';

test( 'Convert styles object to a string', () => {
	const styles = {
		color: 'red',
		'background-color': 'blue',
	};

	const result = getStylesString( styles );

	expect( result ).toBe( 'color:red;background-color:blue' );
} );

test( 'Get the existing styles of the element that are supported', () => {
	const inlineStyles = 'color:red;background-color:blue';

	const supportedProperties = [ 'color', 'background-color' ];

	const result = getFilteredExistingStyles( inlineStyles, supportedProperties );

	expect( result ).toEqual( {
		color: 'red',
		'background-color': 'blue',
	} );
} );
