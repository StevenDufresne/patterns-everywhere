/**
 * Convert styles object to a string.
 * @param {Array} styles
 */
export const getStylesString = ( styles ) => {
	return Object.entries( styles )
		.map( ( [ prop, value ] ) => `${ prop }:${ value }` )
		.join( ';' );
};

/**
 * Check if a property should be applied if inherited.
 * @param element
 * @param prop
 */
// const shouldApplyIfInherited = ( element, prop ) => {
// 	if ( prop !== 'background' && prop !== 'background-color' ) {
// 		return true;
// 	}

// 	return isPropertyDirectlyApplied( element, prop );
// };

/**
 * Check if a property is directly applied to an element.
 * @param element
 * @param property
 */
// function isPropertyDirectlyApplied( element, property ) {
// 	if ( element.style[ property ] ) {
// 		return true;
// 	}

// 	for ( const sheet of document.styleSheets ) {
// 		try {
// 			for ( const rule of sheet.cssRules ) {
// 				if ( element.matches( rule.selectorText ) ) {
// 					if ( rule.style[ property ] ) {
// 						return true;
// 					}
// 				}
// 			}
// 		} catch ( e ) {
// 			// Ignore SecurityErrors for cross-origin stylesheets
// 		}
// 	}

// 	return false; // Default fallback: property is not directly applied
// }

/**
 * Get the computed styles of the element that are supported.
 * @param {Array} computedStyles
 * @param {Array} supportedProperties
 * @return {Object} styles
 */
const getFilteredComputedStyles = ( computedStyles, supportedProperties ) => {
	return Array.from( computedStyles ).reduce( ( styles, prop ) => {
		if ( supportedProperties.includes( prop ) ) {
			styles[ prop ] = computedStyles.getPropertyValue( prop );
		}
		return styles;
	}, {} );
};

/**
 *  Get the existing styles of the element that are on the element via the style attribute.
 * @param {string} inlineStyles
 * @param {Array}  supportedProperties
 * @return {Object} Key value pair of styles
 */
export const getFilteredExistingStyles = (
	inlineStyles,
	supportedProperties
) => {
	return inlineStyles.split( ';' ).reduce( ( styles, style ) => {
		const [ prop, value ] = style.split( ':' );
		if ( supportedProperties.includes( prop ) ) {
			styles[ prop ] = value;
		}
		return styles;
	}, {} );
};

/**
 * Recursively loop through elements and append styles to the 'style' attribute.
 *
 * @param {HTMLElement} element
 * @param {Array}       supportedProperties
 * @return {void}
 */
function appendStylesToElements( element, supportedProperties ) {
	// Retrieve the computed styles from the data-raw attribute.
	const filteredStyles = JSON.parse( element.getAttribute( 'data-raw' ) );

	// Get the existing styles of the element that are supported.
	const existingStyles = getFilteredExistingStyles(
		element.getAttribute( 'style' ) || '',
		supportedProperties
	);

	// Merge styles
	const styleString = getStylesString( {
		...filteredStyles,
		...existingStyles,
	} );

	// clean up the element
	element.setAttribute( 'style', styleString );

	// loop through the children of the element and do the same thing
	element.childNodes.forEach( ( child ) => {
		// eslint-disable-next-line no-undef
		if ( child instanceof HTMLElement ) {
			appendStylesToElements( child, supportedProperties );
		}
	} );
}

function appendComputedStylesToDataRaw(
	getComputedStyle,
	element,
	supportedProperties
) {
	// Function to loop through an element and its children
	function processElement( el ) {
		// Get computed styles
		const computedStyles = getFilteredComputedStyles(
			getComputedStyle( element ),
			supportedProperties
		);
		// Convert styles object to JSON string
		const stylesJSON = JSON.stringify( computedStyles );

		// Append JSON string to data-raw attribute
		el.setAttribute( 'data-raw', stylesJSON );

		// Loop through children
		for ( let i = 0; i < el.children.length; i++ ) {
			const child = el.children[ i ];
			// Recursively process child elements
			processElement( child );
		}
	}

	// Start processing from the given element
	processElement( element );
}

/**
 * Remove the data attributes from the element and it's children through recursion.
 * @param {HTMLElement} element
 * @return {void}
 */
export function removeDataAttributes( element ) {
	element.removeAttribute( 'data-raw' );
	element.childNodes.forEach( ( child ) => {
		// eslint-disable-next-line no-undef
		if ( child instanceof HTMLElement ) {
			removeDataAttributes( child );
		}
	} );
}

/**
 * Get the contents to copy with all the style properties appended.
 * @param {Object}      window  The global window object
 * @param {HTMLElement} element
 * @return {string} element.outerHTML
 */
export function getContentsToCopy( window, element ) {
	// Define supported style properties.
	const supportedProperties = [
		'color',
		'background-color',
		'background',
		'font-size',
		'font-weight',
		'font-family',
		'line-height',
		'display',
		'flex-direction',
		'justify-content',
		'align-items',
		'flex-wrap',
		'flex-direction',
		'padding-right',
		'padding-left',
		'padding-top',
		'padding-bottom',
		'margin-right',
		'margin-left',
		'margin-top',
		'margin-bottom',
	];

	// Loop through and append computed styles to data-raw attribute
	// Its easier to do this because as soon as you clone you lose there props
	appendComputedStylesToDataRaw(
		window.getComputedStyle,
		element,
		supportedProperties
	);

	// Clone the element now that we have the computed styles appended to the element
	const clonedElement = element.cloneNode( true );

	// Loop through all the elements and append their relevant styles to the `style` attribute.
	appendStylesToElements( clonedElement, supportedProperties );

	// Remove the data-raw attribute to clean up the element.
	removeDataAttributes( clonedElement );

	return clonedElement.outerHTML;
}

/**
 * Copy the element and its content to the clipboard.
 * @param {HTMLElement}  element
 * @param {HTMLDocument} document
 */
export function copyElementAndContent( element, document ) {
	if ( ! element ) {
		return;
	}

	const textarea = document.createElement( 'textarea' );
	const contents = getContentsToCopy( window, element );

	// Wrap with a div so we hit our `raw` transfer.
	textarea.value = `<div>${ contents }</div>`;
	document.body.appendChild( textarea );

	textarea.select();
	document.execCommand( 'copy' );

	document.body.removeChild( textarea );
}
