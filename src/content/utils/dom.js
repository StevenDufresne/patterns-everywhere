import { getBlockSupports, shouldIgnore } from './block-supports.js';

/**
 * Convert styles object to a string.
 *
 * @param {Array} styles
 * @return {string} stylesString. IE: "margin:10px;color:red;"
 */
export const getStylesString = ( styles ) => {
	return Object.entries( styles )
		.map( ( [ prop, value ] ) => `${ prop }:${ value }` )
		.join( ';' );
};

/**
 * Check if a property is directly applied to the element.
 *
 * @param {string} property
 * @param {Object} inlineStyles
 * @param {Array}  matchedRules
 * @return {string} value. IE: "red" or "10px", empty if not found.
 */
function getDirectlyAppliedStyleValue( property, inlineStyles, matchedRules ) {
	// Check inline styles
	if ( inlineStyles[ property ] ) {
		return inlineStyles[ property ];
	}
	// Check matched rules
	for ( const style of matchedRules ) {
		if ( style[ property ] ) {
			return style[ property ];
		}
	}
	return '';
}

/**
 * Get all the stylesheets and their rules.
 *
 * @param {Document} document
 * @return {Array} rules
 */
export const getStyleSheetRules = ( document ) => {
	const rules = [];
	const stylesheets = Array.from( document.styleSheets );
	for ( const sheet of stylesheets ) {
		try {
			rules.push( ...Array.from( sheet.cssRules || sheet.rules ) );
		} catch ( e ) {
			// Ignore cross-origin stylesheets or any other errors
			continue;
		}
	}

	return rules;
};

/**
 * Get the matching rules for the element.
 *
 * @param {HTMLElement} element
 * @param {Array}       rules
 * @return {Array} matchedRules
 */
export const getMatchingRules = ( element, rules ) => {
	const matchedRules = [];

	for ( const rule of rules ) {
		if (
			rule.style &&
			rule.selectorText &&
			element.matches( rule.selectorText )
		) {
			matchedRules.push( rule.style );
		}
	}

	return matchedRules;
};

/**
 * Get the computed styles of the element that are supported.
 *
 * @param {HTMLElement} element
 * @param {Object}      computedStyles
 * @param {Array}       rules
 * @return {Object} styles. Ie: { color: 'red', 'font-size': '16px' }
 */
export const getElementStyles = ( element, computedStyles, rules ) => {
	const tagName = element.tagName;
	let supportedProperties = getBlockSupports( tagName );

	// filter out border color when there isn't a border width set
	// Gutenberg will render a border even without a width, so we need to include it.
	supportedProperties = supportedProperties.filter( ( prop ) => {
		const attrs = {
			'border-bottom-color': 'border-bottom-width',
			'border-left-color': 'border-left-width',
			'border-right-color': 'border-right-width',
			'border-top-color': 'border-top-width',
		};

		if ( attrs[ prop ] ) {
			if ( computedStyles.getPropertyValue( attrs[ prop ] ) === '0px' ) {
				return false;
			}
		}

		return true;
	} );

	return Array.from( supportedProperties ).reduce( ( styles, prop ) => {
		const directlyAppliedValue = getDirectlyAppliedStyleValue(
			prop,
			element.style,
			rules
		);

		// If it's not directly applied, we don't want to include it.
		// It createsa a lot of noise in the clipboard and can render incorrectly in Gutenberg.
		// if ( ! directlyAppliedValue ) {
		// 	return styles;
		// }

		let value = directlyAppliedValue;

		// If the value is a variable, we need to get the computed value instead.
		if (
			! directlyAppliedValue ||
			directlyAppliedValue.includes( 'var(' )
		) {
			value = computedStyles.getPropertyValue( prop );
		}

		if ( shouldIgnore( tagName, prop, value ) ) {
			return styles;
		}

		styles[ prop ] = value;

		return styles;
	}, {} );
};

/**
 * Append computed styles.
 * We need to keep the original element around so we can get it's computed styles.
 * Running window.getComputedStyle on the cloned element will not return anything.
 * So we loop through them side by side and transfer the computed styles from the original to the clone.
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
	// TODO: These can be loaded on page load for performance.
	const styleSheetRules = getStyleSheetRules( document );

	const processElement = ( originalElement, clonedOriginalElement ) => {
		const matchingStyleSheetRules = getMatchingRules(
			originalElement,
			styleSheetRules
		);

		const computedStyles = getElementStyles(
			originalElement,
			getComputedStyle( originalElement ),
			matchingStyleSheetRules
		);

		const styleString = getStylesString( computedStyles );
		// Append the styles to the cloned version of the element.
		if ( styleString.length > 0 ) {
			clonedOriginalElement.setAttribute( 'style', styleString );
		} else {
			// Clear it so we don't have non-matching inline styles if we don't find any matching.
			clonedOriginalElement.removeAttribute( 'style' );
		}

		for ( let i = 0; i < originalElement.children.length; i++ ) {
			processElement(
				originalElement.children[ i ],
				clonedOriginalElement.children[ i ]
			);
		}
	};

	processElement( element, clonedElement );
}

/**
 * Get the contents to copy with all the style properties appended.
 * @param {Object}      window      The global window object
 * @param {HTMLElement} rootElement
 * @return {string} element.outerHTML
 */
export function getContentsToCopy( window, rootElement ) {
	const clonedElement = rootElement.cloneNode( true );

	addComputedStylesToElementStyleAttribute(
		rootElement,
		clonedElement,
		window.getComputedStyle
	);

	// For now, our code will trigger with a div so we need the first element to be a <div>.
	return clonedElement.tagName !== 'DIV'
		? `<div>${ clonedElement.outerHTML.trim() }</div>`
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
