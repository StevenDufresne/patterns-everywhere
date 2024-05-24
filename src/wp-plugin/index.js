const registerBlockType = wp.blocks.registerBlockType;
const createBlock = wp.blocks.createBlock;
const addFilter = wp.hooks.addFilter;
const removeFilter = wp.hooks.removeFilter;
const findTransform = wp.blocks.findTransform;
const getBlockTransforms = wp.blocks.getBlockTransforms;

import {
	getBlockAttributes as _getBlockAttributes,
	getRawTransforms,
} from './utils';

const customBlockName = 'patterns-everywhere/block-for-transform';
const matchingElements = [ 'div', 'section', 'main' ];

// function getListContentSchema( { phrasingContentSchema } ) {
// 	const listContentSchema = {
// 		...phrasingContentSchema,
// 		ul: {},
// 		ol: { attributes: [ 'type', 'start', 'reversed' ] },
// 	};

// 	// Recursion is needed.
// 	// Possible: ul > li > ul.
// 	// Impossible: ul > ul.
// 	[ 'ul', 'ol' ].forEach( ( tag ) => {
// 		listContentSchema[ tag ].children = {
// 			li: {
// 				children: listContentSchema,
// 			},
// 		};
// 	} );

// 	console.log( listContentSchema );

// 	return listContentSchema;
// }

registerBlockType( customBlockName, {
	title: 'Pattern Everywhere Block',
	icon: 'smiley',
	category: 'common',
	transforms: {
		from: [
			// {
			// 	type: 'raw',
			// 	selector: 'ol,ul',
			// 	priority: 1,
			// 	schema: () => ( {
			// 		ol: {
			// 			attributes: [ 'style' ],
			// 			children: '*',
			// 		},
			// 		ul: {
			// 			attributes: [ 'style' ],
			// 			children: '*',
			// 		},
			// 	} ),
			// 	transform: ( element, handler ) => {
			// 		const blockName = element.tagName.toLowerCase();

			// 		const innerBlocks = [];

			// 		for ( const child of element.children ) {
			// 			const block = handler( child );

			// 			if ( block ) {
			// 				innerBlocks.push( block );
			// 			}
			// 		}

			// 		debugger;

			// 		// const attrs = _getBlockAttributes( element );

			// 		// return createBlock(
			// 		// 	`core/${ blockName }`,
			// 		// 	attrs,
			// 		// 	innerBlocks
			// 		// );
			// 	},
			// },
			{
				type: 'raw',
				isMatch: ( node ) =>
					matchingElements.includes( node.nodeName.toLowerCase() ),
				schema: () => ( {
					div: {
						attributes: [ 'style' ],
						children: '*',
					},
				} ),
				transform: ( element ) => {
					/**
					 * Recurse downwards and build blocks from the bottom up so we can nest them as inner blocks.
					 *
					 * @param {HTMLElement} node The node to traverse.
					 * @return {Object|boolean} The block or false if we don't want to create a block.
					 */
					function traverseDOM( node ) {
						const innerBlocks = [];

						removeFilter(
							'blocks.getBlockAttributes',
							'steve/thing'
						);

						for ( const child of node.children ) {
							const block = traverseDOM( child );

							if ( block ) {
								innerBlocks.push( block );
							}
						}

						if (
							! matchingElements.includes(
								node.tagName.toLowerCase()
							)
						) {
							const transforms = getBlockTransforms( 'from' );
							const rawTransform = findTransform(
								getRawTransforms( transforms ),
								( { isMatch } ) =>
									isMatch( node ) &&
									! matchingElements.includes(
										node.tagName.toLowerCase()
									)
							);

							// Default case for when we can't find a transform.
							// The core/paragraph block is Gutenbergs default block.
							if ( ! rawTransform ) {
								return createBlock( 'core/paragraph', {
									content: node.outerHTML,
								} );
							}

							const { transform, blockName } = rawTransform;

							// Not all blocks have raw transforms, so we need them to grab attributes from our node and not their own.
							// If we don't do that, style will be ignored.
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

							// We default to the group block as our main container.
							return createBlock(
								'core/group',
								attrs,
								innerBlocks
							);
						}

						return false;
					}

					return traverseDOM( element );
				},
			},
		],
	},
} );
