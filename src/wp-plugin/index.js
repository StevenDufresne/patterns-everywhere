/**
 * WordPress dependencies
 */
import { createBlock, registerBlockType } from '@wordpress/blocks';
import { addFilter, removeFilter } from '@wordpress/hooks';

/**
 * Local dependencies
 */
import {
	getBlockAttributes as _getBlockAttributes,
	getRawTransform,
} from './utils';

// We will handle this elements instead of using their transforms if they exist.
const handledEls = [
	'div',
	'section',
	'main',
	'footer',
	'header',
	'article',
	'nav',
	'sidebar',
	'img',
	'figure',
	'ul',
	'ol',
	'li',
];

/**
 * Check if the element is a local match.
 * @param {string} tagName The element tag name.
 * @return {boolean} Whether the element is a local match.
 */
const isLocalMatch = ( tagName ) => {
	return handledEls.includes( tagName.toLowerCase() );
};

/**
 * Transform an SVG element into a core/html block.
 * @param {HTMLElement} node The node to transform.
 * @return {Object} The core/html block.
 */
const transformSVG = ( node ) => {
	return createBlock( 'core/html', {
		content: node.outerHTML,
	} );
};

/**
 * Transform an anchor element into a core/buttons block.
 * @param {HTMLElement} node  The node to transform.
 * @param {Object}      attrs The block attributes.
 */
const transformAnchor = ( node, attrs ) => {
	const commonButtonClasses = [ 'btn', 'button' ];
	const classString = node.classList.toString().toLowerCase(); // Convert DOMTokenList to a string
	const hasCommonClass = commonButtonClasses.some(
		( cls ) => classString.indexOf( cls ) !== -1
	);

	if ( hasCommonClass ) {
		return createBlock( 'core/buttons', {}, [
			createBlock( 'core/button', {
				...attrs,
				text: node.innerText,
				url: node.href,
			} ),
		] );
	}

	return createBlock( 'core/paragraph', {
		content: node.outerHTML,
	} );
};

/**
 * Transform a pre or code element into a core/code block.
 * @param {HTMLElement} node  The node to transform.
 * @param {Object}      attrs The block attributes.
 * @return {Object} The core/code block.
 */
const transformCode = ( node, attrs ) => {
	return createBlock( 'core/code', {
		...attrs,
		content: node.innerText,
	} );
};

/**
 * Transform a list element into a core/group block.
 * @param {HTMLElement} node  The node to transform.
 * @param {Object}      attrs The block attributes.
 * @return {Object} The core/group block.
 */
const transformList = ( node, attrs ) => {
	return createBlock( 'core/group', attrs, [
		createBlock( 'core/paragraph', {
			content: node.innerText,
		} ),
	] );
};

/**
 * Transform an Image element into a core/image block.
 * @param {HTMLElement} node  The node to transform.
 * @param {Object}      attrs The block attributes.
 * @return {Object} The core/image block.
 *
 * TODO: We don't want to provide ours but the default one doesn't apply styles properly.
 */
const transformImage = ( node, attrs ) => {
	return createBlock( 'core/image', {
		...attrs,
		url: node.src,
		alt: node.alt,
	} );
};

/**
 * Recurse downwards and build blocks from the bottom up so we can nest them as inner blocks.
 *
 * @param {HTMLElement} node The node to traverse.
 * @return {Object|boolean} The block or false if we don't want to create a block.
 */
export const recurseDOM = ( node ) => {
	const innerBlocks = [];

	removeFilter( 'blocks.getBlockAttributes', 'steve/thing' );

	for ( const child of node.children ) {
		/**
		 * We want to handle specific elements differently.
		 */
		switch ( child.tagName.toLowerCase() ) {
			case 'a':
				innerBlocks.push(
					transformAnchor( child, _getBlockAttributes( child ) )
				);
				break;

			case 'svg':
				innerBlocks.push( transformSVG( child ) );
				break;

			case 'pre':
			case 'code':
				innerBlocks.push(
					transformCode( child, _getBlockAttributes( child ) )
				);
				break;

			case 'img':
				innerBlocks.push(
					transformImage( child, _getBlockAttributes( child ) )
				);
				break;

			case 'p':
				// If the paragraph has a single anchor child, we want to transform it to a button maybe.
				if (
					child.childNodes.length === 1 &&
					'a' === child.childNodes[ 0 ].nodeName.toLowerCase()
				) {
					innerBlocks.push(
						transformAnchor(
							child.childNodes[ 0 ],
							_getBlockAttributes( child.childNodes[ 0 ] )
						)
					);
					break;
				}
			default:
				const block = recurseDOM( child );

				if ( block ) {
					innerBlocks.push( block );
				}
		}
	}

	/**
	 * We want to use existing transforms for blocks that have them and don't match our custom elements above.
	 */
	if ( ! isLocalMatch( node.tagName ) ) {
		const rawTransform = getRawTransform( node, handledEls );

		// Default case for when we can't find a transform.
		// The core/paragraph block is Gutenberg's default block.
		if ( ! rawTransform ) {
			return createBlock( 'core/paragraph', {
				content: node.outerHTML,
			} );
		}

		const { transform, blockName } = rawTransform;

		// We want to make sure if a block uses its transform, it's uses our attributes.
		addFilter(
			'blocks.getBlockAttributes',
			'steve/thing',
			( attrs, blockType ) => {
				if ( blockType.name !== blockName ) {
					return attrs;
				}

				return {
					...attrs,
					..._getBlockAttributes( node ),
				};
			}
		);

		return transform( node );
	}

	// Special case for <li> elements that don't have children.
	if ( node.tagName.toLowerCase() === 'li' && innerBlocks.length < 1 ) {
		return transformList( node, _getBlockAttributes( node ) );
	}

	// We don't want to create group blocks for empty containers.
	// TODO: If we have no children we should probably create a core/spacer.
	if ( innerBlocks.length > 0 ) {
		return createBlock(
			'core/group',
			_getBlockAttributes( node ),
			innerBlocks
		);
	}

	return false;
};

/**
 * For now, register our own block so we can provide custom transforms.
 */
registerBlockType( 'patterns-everywhere/block-for-transform', {
	title: 'Pattern Everywhere Block',
	icon: 'smiley',
	category: 'common',
	transforms: {
		from: [
			{
				type: 'raw',
				priority: 1,
				isMatch: ( node ) => isLocalMatch( node.nodeName ),
				schema: () => ( {
					div: {
						attributes: [ 'style', 'src', 'href', 'alt' ],
						children: '*',
					},
				} ),
				transform: recurseDOM,
			},
		],
	},
} );
