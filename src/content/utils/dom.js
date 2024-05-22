import { getBlockSupports, shouldIgnore } from './block-supports.js';

/**
 * Convert styles object to a string.
 * @param {Array} styles
 * @return {string} stylesString. IE: "margin:10px;color:red;"
 */
export const getStylesString = ( styles ) => {
	return Object.entries( styles )
		.map( ( [ prop, value ] ) => `${ prop }:${ value }` )
		.join( ';' );
};

function isDirectlyApplied( property, inlineStyles, matchedRules ) {
	// Check inline styles
	if ( inlineStyles[ property ] ) {
		return true;
	}
	// Check matched rules
	for ( const style of matchedRules ) {
		if ( style[ property ] ) {
			return true;
		}
	}
	return false;
}

/**
 * Get the computed styles of the element that are supported.
 * @param {HTMLElement} element
 * @param {Object}      computedStyles
 * @param {Document}    document
 * @return {Object} styles. Ie: { color: 'red', 'font-size': '16px' }
 */
export const getElementStyles = ( element, computedStyles, document ) => {
	const matchedRules = [];

	// Get all the stylesheets and their rules
	const stylesheets = Array.from( document.styleSheets );
	for ( const sheet of stylesheets ) {
		try {
			const rules = Array.from( sheet.cssRules || sheet.rules );
			for ( const rule of rules ) {
				if (
					rule.style &&
					rule.selectorText &&
					element.matches( rule.selectorText )
				) {
					matchedRules.push( rule.style );
				}
			}
		} catch ( e ) {
			// Ignore cross-origin stylesheets or any other errors
			continue;
		}
	}

	return Array.from( computedStyles ).reduce( ( styles, prop ) => {
		const tagName = element.tagName;
		const supports = getBlockSupports( tagName );

		if ( supports.includes( prop ) ) {
			const value = computedStyles.getPropertyValue( prop );
			if ( ! shouldIgnore( tagName, prop, value ) ) {
				// if is directly applied
				if ( isDirectlyApplied( prop, element.style, matchedRules ) ) {
					styles[ prop ] = value;
				}
			}
		}

		return styles;
	}, {} );
};

/**
 * Append computed styles.
 *
 * @param {HTMLElement} element
 * @param {HTMLElement} clonedElement
 * @param {Function}    getComputedStyle
 * @return {void}
 */
export function addComputedStylesToElementStyleAttribute(
	element,
	clonedElement,
	getComputedStyle
) {
	function processElement( originalElement, _clonedElement ) {
		const computedStyles = getElementStyles(
			originalElement,
			getComputedStyle( originalElement ),
			document
		);

		const styleString = getStylesString( computedStyles );

		// Append the styles to the clone version of the element.
		if ( styleString.length > 0 ) {
			_clonedElement.setAttribute( 'style', styleString );
		}

		for ( let i = 0; i < originalElement.children.length; i++ ) {
			processElement(
				originalElement.children[ i ],
				_clonedElement.children[ i ]
			);
		}
	}

	// Start processing from the given element
	processElement( element, clonedElement );
}

/**
 * Get the contents to copy with all the style properties appended.
 * @param {Object}      window      The global window object
 * @param {HTMLElement} rootElement
 * @return {string} element.outerHTML
 */
export function getContentsToCopy( window, rootElement ) {
	// Define supported style properties.
	const clonedElement = rootElement.cloneNode( true );

	addComputedStylesToElementStyleAttribute(
		rootElement, // need to run window.getComputedStyle on this element, clone elements don't have computed styles
		clonedElement,
		window.getComputedStyle
	);

	// For now our code will trigger with a div
	return clonedElement.tagName !== 'DIV'
		? `<div>${ clonedElement.outerHTML } </div>`
		: clonedElement.outerHTML;
}

/**
 * Copy the element and its content to the clipboard.
 * @param {HTMLElement}  rootElement
 * @param {HTMLDocument} document
 */
export function copyElementAndContent( rootElement, document ) {
	if ( ! rootElement ) {
		return;
	}

	const textarea = document.createElement( 'textarea' );
	const contents = getContentsToCopy( window, rootElement );

	// Wrap with a div so we hit our `raw` transfer.
	textarea.value = contents;
	document.body.appendChild( textarea );

	textarea.select();
	document.execCommand( 'copy' );

	document.body.removeChild( textarea );
}
