/* global chrome */

import { addStyle, removeStyle, displayConfirmationMessage } from './utils.js';

const MESSAGE_NAMESPACE = 'PATTERNS_EVERYWHERE';

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

const shouldApplyIfInherited = ( element, prop ) => {
	if ( prop !== 'background' && prop !== 'background-color' ) {
		return true;
	}

	return isPropertyDirectlyApplied( element, prop );
};

function isPropertyDirectlyApplied( element, property ) {
	if ( element.style[ property ] ) {
		return true;
	}

	for ( const sheet of document.styleSheets ) {
		try {
			for ( const rule of sheet.cssRules ) {
				if ( element.matches( rule.selectorText ) ) {
					if ( rule.style[ property ] ) {
						return true;
					}
				}
			}
		} catch ( e ) {
			// Ignore SecurityErrors for cross-origin stylesheets
		}
	}

	return false; // Default fallback: property is not directly applied
}

/**
 * Get the computed styles of the element that are supported.
 * @param {Window}      window
 * @param {HTMLElement} element
 */
const getFilteredComputedStyles = ( window, element ) => {
	const computedStyles = window.getComputedStyle( element );

	return Array.from( computedStyles ).reduce( ( styles, prop ) => {
		if (
			supportedProperties.includes( prop ) &&
			shouldApplyIfInherited( element, prop )
		) {
			styles[ prop ] = computedStyles.getPropertyValue( prop );
		}
		return styles;
	}, {} );
};

/**
 *  Get the existing styles of the element that are supported.
 * @param {Window}      window
 * @param {HTMLElement} element
 */
const getFilteredExistingStyles = ( window, element ) => {
	const inlineStyles = element.getAttribute( 'style' ) || '';

	return inlineStyles.split( ';' ).reduce( ( styles, style ) => {
		const [ prop, value ] = style.split( ':' );
		if ( supportedProperties.includes( prop ) ) {
			styles[ prop ] = value;
		}
		return styles;
	}, {} );
};

/**
 * Convert styles object to a string.
 * @param {Array} styles
 */
const getStylesString = ( styles ) => {
	return Object.entries( styles )
		.map( ( [ prop, value ] ) => `${ prop }:${ value }` )
		.join( ';' );
};

/**
 * Modify the element property.
 * @param {HTMLElement} element
 */
function modifyElementProperty( element ) {
	// Define supported style properties
	const filteredStyles = JSON.parse( element.getAttribute( 'data-raw' ) );

	const existingStyles = getFilteredExistingStyles( window, element );

	// Merge styles
	const styleString = getStylesString( {
		...filteredStyles,
		...existingStyles,
	} );

	// clean up the element
	element.setAttribute( 'style', styleString );

	element.removeAttribute( 'data-raw' );

	// loop through the children of the element and do the same thing
	element.childNodes.forEach( ( child ) => {
		if ( child instanceof HTMLElement ) {
			modifyElementProperty( child );
		}
	} );
}

function appendComputedStylesToDataRaw( element ) {
	// Function to loop through an element and its children
	function processElement( el ) {
		// Get computed styles
		const computedStyles = getFilteredComputedStyles( window, el );
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

function removeDataAttributes( element ) {
	element.removeAttribute( 'data-raw' );
	element.childNodes.forEach( ( child ) => {
		if ( child instanceof HTMLElement ) {
			removeDataAttributes( child );
		}
	} );
}

/**
 * Copy the element and its content to the clipboard.
 * @param {HTMLElement} element
 */
function copyElementAndContent( element ) {
	if ( ! ( element instanceof HTMLElement ) ) {
		return;
	}

	const textarea = document.createElement( 'textarea' );

	// Loop through and append computed styles to data-raw attribute
	// Its easier to do this because as soon as you clone you lose there props
	appendComputedStylesToDataRaw( element );

	// Clone the element now that we have the computed styles
	const clonedElement = element.cloneNode( true );
	modifyElementProperty( clonedElement );

	// Remove the data-raw attribute
	removeDataAttributes( element );

	// Wrap with a div so we hit our `raw` transfer.
	textarea.value = `<div>${ clonedElement.outerHTML }</div>`;
	document.body.appendChild( textarea );

	textarea.select();
	document.execCommand( 'copy' );

	document.body.removeChild( textarea );

	displayConfirmationMessage();
}

function onMouseOver( event ) {
	addStyle( event.target );
}
function onClick( event ) {
	copyElementAndContent( event.target );
}
function onMouseOut( event ) {
	removeStyle( event.target );
}

function fromUs( message ) {
	return message.sender && message.sender === MESSAGE_NAMESPACE;
}

chrome.runtime.onMessage.addListener(
	function ( message, sender, sendResponse ) {
		if ( ! fromUs( message ) ) {
			return;
		}

		if ( message.isEnabled ) {
			document.body.addEventListener( 'mouseover', onMouseOver );
			document.body.addEventListener( 'mouseout', onMouseOut );
			document.body.addEventListener( 'click', onClick );
		} else {
			document.body.removeEventListener( 'mouseover', onMouseOver );
			document.body.removeEventListener( 'mouseout', onMouseOut );
			document.body.removeEventListener( 'click', onClick );
		}

		sendResponse( { received: true } );
	}
);
