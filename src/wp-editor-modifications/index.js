const registerBlockType = wp.blocks.registerBlockType;
const createBlock = wp.blocks.createBlock;
const addFilter = wp.hooks.addFilter;
const removeFilter = wp.hooks.removeFilter;
const findTransform = wp.blocks.findTransform;
const getRawTransforms = wp.blocks.getRawTransforms;
const getBlockAttributes = wp.blocks.getBlockAttributes;

const customBlockName = 'patterns-everywhere/block-for-transform';

const matchingElements = [ 'div', 'section', 'main' ];

registerBlockType( customBlockName, {
	title: 'Pattern Everywhere Block',
	icon: 'smiley',
	category: 'common',
	transforms: {
		from: [
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
				transform: ( element, handler ) => {
					/**
					 * Get the key and value from a string.
					 * @param {string} value The value to split.
					 * @return {Array} The key and value.
					 */
					function getKeyValue( value ) {
						return value
							.split( ':' )
							.map( ( item ) => item.trim() );
					}

					/**
					 * Split the style attributes into an array.
					 * @param {string} props The style attributes.
					 * @return {Array} The style attributes as an array.
					 */
					function splitProps( props ) {
						return props
							.split( ';' )
							.filter( ( item ) => item !== '' );
					}

					/**
					 * Convert the style attributes to block attributes.
					 * @param {string} props   The style attributes.
					 * @param {string} tagName The tag name of the element.
					 * @return {Object} The block attributes.
					 */
					function convertPropsToAttributes( props ) {
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
						};

						const layoutAttributes = {};
						const typographyAttributes = {};
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
							background: ( value ) => {
								styleAttributes.color.background = value;
							},
							'background-color': ( value ) => {
								styleAttributes.color.background = value;
							},
							color: ( value ) => {
								styleAttributes.color.text = value;
								styleAttributes.elements.link.color.text =
									value;
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
								styleAttributes.border.radius.bottomLeft =
									value;
							},
							'border-bottom-right-radius': ( value ) => {
								styleAttributes.border.radius.bottomRight =
									value;
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
								typographyAttributes.lineHeight = value;
							},
							'font-size': ( value ) => {
								typographyAttributes.fontSize = value;
							},
							'font-weight': ( value ) => {
								typographyAttributes.fontWeight = value;
							},
							'font-style': ( value ) => {
								typographyAttributes.fontStyle = value;
							},
							'text-align': ( value ) => {
								// Paragraphs use this.
								align = value;

								// Headings use this.
								textAlign = value;
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

						return {
							style: styleAttributes,
							layout: layoutAttributes,
							typography: typographyAttributes,
							align,
							textAlign,
						};
					}

					/**
					 * Get the block attributes from the node.
					 * @param {HTMLElement} _node The node to get the attributes from.
					 * @return {Object} The block attributes.
					 */
					function _getBlockAttributes( _node ) {
						const stylesSetOnElement =
							_node.getAttribute( 'style' );
						if ( ! stylesSetOnElement ) {
							return {};
						}

						return convertPropsToAttributes( stylesSetOnElement );
					}

					/**
					 * Traverse the DOM and create blocks.
					 * @param {HTMLElement} node The node to traverse.
					 * @return {Object} The block.
					 */
					function traverseDOM( node ) {
						const innerBlocks = [];
						// Remove the existing filter
						removeFilter(
							'blocks.getBlockAttributes',
							'steve/thing'
						);

						for ( const child of node.children ) {
							const block = traverseDOM( child );

							innerBlocks.push( block );
						}

						// Grab all the raw transforms from the block library
						const rawTransform = findTransform(
							getRawTransforms(),
							( { isMatch } ) => isMatch( node )
						);
						if ( ! rawTransform ) {
							// We currently defailt to a paragraph block if we can't find a transform
							// to rely on rich-text.
							// This may not work for non phrasing content with no tansform
							// available.
							return createBlock( 'core/paragraph', {
								content: node.outerHTML,
							} );
						}

						let { transform, blockName } = rawTransform;

						// Not all blocks have transforms, so we need to add the attributes manually.
						// This isn't efficient, but it's the only way to get the attributes.
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

						// We don't want to run the transform if the node is a div or it will cause an infinite loop.
						if (
							transform &&
							! matchingElements.includes(
								node.tagName.toLowerCase()
							)
						) {
							// Right now, we can't apply styles to no div blocks.
							// There's no way to pass style attributes through the block attributes.
							const block = transform( node, handler );

							// If we default apply the classes and we copy existing gutenberg markup, it will cause validation issues.
							// if ( node.hasAttribute( 'class' ) ) {
							// 	block.attributes.className =
							// 		node.getAttribute( 'class' );
							// }

							return block;
						}

						// If it's our block, we want to use the core/group block.
						if ( customBlockName === blockName ) {
							blockName = 'core/group';
						}

						const attrs = getBlockAttributes( blockName, node );

						return createBlock( blockName, attrs, innerBlocks );
					}

					return traverseDOM( element );
				},
			},
		],
	},
} );
