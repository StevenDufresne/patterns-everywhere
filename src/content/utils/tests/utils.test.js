import { getStylesString, getFilteredExistingStyles } from '../dom';

describe( 'Style formatting', function () {
	test( 'Convert styles object to a string', () => {
		const styles = {
			color: 'red',
			'background-color': 'blue',
		};

		const result = getStylesString( styles );

		expect( result ).toBe( 'color:red;background-color:blue' );
	} );

	test( 'Retrieves filtered inline styles from the element', () => {
		let inlineStyles = 'color:red;background-color:blue';
		inlineStyles += ';margin:0;padding:0;'; // Should be ignored

		const supportedProperties = [ 'color', 'background-color' ];

		const result = getFilteredExistingStyles(
			inlineStyles,
			supportedProperties
		);

		expect( result ).toEqual( {
			color: 'red',
			'background-color': 'blue',
		} );
	} );
} );
