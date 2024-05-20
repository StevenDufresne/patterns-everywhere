const registerBlockType = wp.blocks.registerBlockType;
const createBlock = wp.blocks.createBlock;
const addFilter = wp.hooks.addFilter;
const removeFilter = wp.hooks.removeFilter;
const findTransform = wp.blocks.findTransform;
const getRawTransforms = wp.blocks.getRawTransforms;
const getBlockAttributes = wp.blocks.getBlockAttributes;

const customBlockName = 'patterns-everywhere/block-for-transform';

registerBlockType( customBlockName, {
	title: 'My Custom Block',
	icon: 'smiley',
	category: 'common',
	transforms: {
		from: [
			{
				type: 'raw',
				isMatch: ( node ) => node.nodeName === 'DIV',
				schema: () => ( {
					div: {
						attributes: [ 'style' ],
						children: '*',
					},
				} ),
				transform: ( element, handler ) => {
					console.log( 'running transform' );
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
					 * @param {string} props The style attributes.
					 * @return {Object} The block attributes.
					 */
					function convertPropsToAttributes( props ) {
						const styleAttributes = {
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

						const styleMappings = {
							display: ( value ) => {
								if ( value === 'flex' ) {
									layoutAttributes.type = 'flex';
									layoutAttributes.flexWrap = 'nowrap';
								}
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
							( attrs ) => {
								return {
									...attrs,
									..._getBlockAttributes( node ),
								};
							}
						);

						// We don't want to run the transform if the node is a div or it will cause an infinite loop.
						if ( transform && node.tagName !== 'DIV' ) {
							// Right now, we can't apply styles to no div blocks.
							// There's no way to pass style attributes through the block attributes.
							const block = transform( node, handler );

							if ( node.hasAttribute( 'class' ) ) {
								block.attributes.className =
									node.getAttribute( 'class' );
							}

							return block;
						}

						if ( customBlockName === blockName ) {
							blockName = 'core/group';
						}

						const attrs = getBlockAttributes( blockName, node );

						console.log( blockName );

						return createBlock( blockName, attrs, innerBlocks );
					}

					return traverseDOM( element );
				},
			},
		],
	},
} );
