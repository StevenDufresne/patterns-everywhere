import { findTransform, getBlockTransforms } from '@wordpress/blocks';

/**
 * Get the key and value from a string.
 * @param {string} value The value to split.
 * @return {Array} The key and value.
 */
const getKeyValue = ( value ) => {
	return value.split( ':' ).map( ( item ) => item.trim() );
};

/**
 * Split the style attributes into an array.
 * @param {string} props The style attributes.
 * @return {Array} The style attributes as an array.
 */
const splitProps = ( props ) => {
	return props.split( ';' ).filter( ( item ) => item !== '' );
};

/**
 * Get the block attributes from the node.
 * @param {HTMLElement} node The node to get the attributes from.
 * @return {Object} The block attributes.
 */
export const getBlockAttributes = ( node ) => {
	const stylesSetOnElement = node.getAttribute( 'style' );
	if ( ! stylesSetOnElement ) {
		return {};
	}

	return convertPropsToAttributes( stylesSetOnElement, node );
};

export const getRawTransform = ( node, excludes = [] ) => {
	const rawTransforms = getBlockTransforms( 'from' )
		.filter( ( { type } ) => type === 'raw' )
		.map( ( transform ) => {
			return transform.isMatch
				? transform
				: {
						...transform,
						isMatch: () =>
							transform.selector &&
							node.matches( transform.selector ),
				  };
		} );

	return findTransform(
		rawTransforms,
		( { isMatch } ) =>
			isMatch( node ) && ! excludes.includes( node.tagName.toLowerCase() )
	);
};

/**
 * Convert the style attributes to block attributes.
 * @param {string} props The style attributes.
 * @return {Object} The block attributes.
 */
const convertPropsToAttributes = ( props ) => {
	const styleAttributes = {
		border: {
			radius: {},
			top: {},
			right: {},
			bottom: {},
			left: {},
		},
		color: {},
		spacing: {
			padding: {},
			margin: {},
		},
		elements: {
			link: {
				color: {},
			},
		},
		typography: {},
	};

	const layoutAttributes = {};
	let align = '';
	let textAlign = '';

	const styleMappings = {
		display: ( value ) => {
			if ( value === 'flex' ) {
				layoutAttributes.type = value;
				layoutAttributes.flexWrap = 'nowrap';
			}

			if ( value === 'grid' ) {
				layoutAttributes.type = value;
			}

			// Don't handle `display:block`; causes Gutenberg crashes.
		},
		'justify-content': ( value ) => {
			layoutAttributes.justifyContent = value;
		},
		'flex-direction': ( value ) => {
			if ( value === 'column' ) {
				layoutAttributes.orientation = 'vertical';
			} else {
				layoutAttributes.orientation = 'horizontal';
			}
		},
		'background-color': ( value ) => {
			styleAttributes.color.background = value;
		},
		color: ( value ) => {
			styleAttributes.color.text = value;
			styleAttributes.elements.link.color.text = value;
		},
		'padding-bottom': ( value ) => {
			styleAttributes.spacing.padding.bottom = value;
		},
		'padding-left': ( value ) => {
			styleAttributes.spacing.padding.left = value;
		},
		'padding-right': ( value ) => {
			styleAttributes.spacing.padding.right = value;
		},
		'padding-top': ( value ) => {
			styleAttributes.spacing.padding.top = value;
		},
		'margin-bottom': ( value ) => {
			styleAttributes.spacing.margin.bottom = value;
		},
		'margin-left': ( value ) => {
			styleAttributes.spacing.margin.left = value;
		},
		'margin-right': ( value ) => {
			styleAttributes.spacing.margin.right = value;
		},
		'margin-top': ( value ) => {
			styleAttributes.spacing.margin.top = value;
		},
		'border-top-left-radius': ( value ) => {
			styleAttributes.border.radius.topLeft = value;
		},
		'border-top-right-radius': ( value ) => {
			styleAttributes.border.radius.topRight = value;
		},
		'border-bottom-left-radius': ( value ) => {
			styleAttributes.border.radius.bottomLeft = value;
		},
		'border-bottom-right-radius': ( value ) => {
			styleAttributes.border.radius.bottomRight = value;
		},
		'border-top-color': ( value ) => {
			styleAttributes.border.top.color = value;
		},
		'border-top-width': ( value ) => {
			styleAttributes.border.top.width = value;
		},
		'border-right-color': ( value ) => {
			styleAttributes.border.right.color = value;
		},
		'border-right-width': ( value ) => {
			styleAttributes.border.right.width = value;
		},
		'border-bottom-color': ( value ) => {
			styleAttributes.border.bottom.color = value;
		},
		'border-bottom-width': ( value ) => {
			styleAttributes.border.bottom.width = value;
		},
		'border-left-color': ( value ) => {
			styleAttributes.border.left.color = value;
		},
		'border-left-width': ( value ) => {
			styleAttributes.border.left.width = value;
		},
		'line-height': ( value ) => {
			styleAttributes.typography.lineHeight = value;
		},
		'font-size': ( value ) => {
			styleAttributes.typography.fontSize = value;
		},
		'font-weight': ( value ) => {
			styleAttributes.typography.fontWeight = value;
		},
		'font-style': ( value ) => {
			styleAttributes.typography.fontStyle = value;
		},
		'text-align': ( value ) => {
			// Paragraphs use this.
			align = value;

			// Headings use this.
			textAlign = value;
		},
		'row-gap': ( value ) => {
			styleAttributes.spacing.blockGap = value;
		},
		'column-gap': ( value ) => {
			styleAttributes.spacing.blockGap = value;
		},
	};

	// Start assigning the values.
	const propsArray = splitProps( props );
	for ( const styleProp of propsArray ) {
		const [ key, value ] = getKeyValue( styleProp );

		if ( styleMappings[ key ] ) {
			styleMappings[ key ]( value );
		}
	}

	[ 'top', 'right', 'bottom', 'left' ].forEach( ( direction ) => {
		if ( ! styleAttributes.border[ direction ].width ) {
			delete styleAttributes.border[ direction ].color;
		}
	} );

	return {
		style: styleAttributes,
		layout: layoutAttributes,
		align,
		textAlign,
	};
};
