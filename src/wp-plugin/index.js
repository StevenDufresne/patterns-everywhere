import {
	createBlock,
	registerBlockType,
	findTransform,
	getBlockTransforms,
} from '@wordpress/blocks';
import { addFilter, removeFilter } from '@wordpress/hooks';

import {
	getBlockAttributes as _getBlockAttributes,
	getRawTransforms,
} from './utils';

const customBlockName = 'patterns-everywhere/block-for-transform';

// We will handle this elements instead of using their transforms if they exist.
const handledEls = [
	'div',
	'section',
	'main',
	'footer',
	'header',
	'article',
	'ul',
	'li',
	'ol',
	'nav',
	'sidebar',
];

const handleSVG = ( node ) => {
	return createBlock( 'core/html', {
		content: node.outerHTML,
	} );
};

const handleAnchor = ( node, attrs ) => {
	const commonButtonClasses = [ 'btn', 'button' ];
	const classString = node.classList.toString(); // Convert DOMTokenList to a string
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
 * Recurse downwards and build blocks from the bottom up so we can nest them as inner blocks.
 *
 * @param {HTMLElement} node The node to traverse.
 * @return {Object|boolean} The block or false if we don't want to create a block.
 */
export const recurseDOM = ( node ) => {
	const innerBlocks = [];

	removeFilter( 'blocks.getBlockAttributes', 'steve/thing' );

	for ( const child of node.children ) {
		switch ( child.tagName.toLowerCase() ) {
			case 'a':
				innerBlocks.push(
					handleAnchor( child, _getBlockAttributes( child ) )
				);
				break;
			case 'svg':
				innerBlocks.push( handleSVG( child ) );
				break;
			default:
				const block = recurseDOM( child );

				if ( block ) {
					innerBlocks.push( block );
				}
		}
	}

	if ( ! handledEls.includes( node.tagName.toLowerCase() ) ) {
		const transforms = getBlockTransforms( 'from' );
		const rawTransform = findTransform(
			getRawTransforms( transforms ),
			( { isMatch } ) =>
				isMatch( node ) &&
				! handledEls.includes( node.tagName.toLowerCase() )
		);

		// Handle the core/paragraph block for p with > a child.
		if ( 'p' === node.tagName.toLowerCase() ) {
			if (
				node.children.length === 1 &&
				'a' === node.children[ 0 ].tagName.toLowerCase()
			) {
				return handleAnchor(
					node.children[ 0 ],
					_getBlockAttributes( node.children[ 0 ] )
				);
			}
		}

		// Default case for when we can't find a transform.
		// The core/paragraph block is Gutenbergs default block.
		if ( ! rawTransform ) {
			return createBlock( 'core/paragraph', {
				content: node.outerHTML,
			} );
		}

		const { transform, blockName } = rawTransform;

		if ( blockName === 'core/code' ) {
			return createBlock( 'core/code', {
				content: node.innerText,
			} );
		}

		// Not all blocks have raw transforms, so we need them to grab attributes from our node and not their own.
		// If we don't do that, styles will be ignored.
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

	// We don't want to create group blocks for empty containers.
	// TODO: If we have no children we should probably create a core/spacer.
	if ( innerBlocks.length > 0 ) {
		const attrs = _getBlockAttributes( node );

		return createBlock( 'core/group', attrs, innerBlocks );
	}

	return false;
};

registerBlockType( customBlockName, {
	title: 'Pattern Everywhere Block',
	icon: 'smiley',
	category: 'common',
	transforms: {
		from: [
			{
				type: 'raw',
				isMatch: ( node ) =>
					handledEls.includes( node.nodeName.toLowerCase() ),
				schema: () => ( {
					div: {
						attributes: [ 'style', 'src', 'href' ],
						children: '*',
					},
				} ),
				transform: ( element ) => {
					return recurseDOM( element );
				},
			},
		],
	},
} );
