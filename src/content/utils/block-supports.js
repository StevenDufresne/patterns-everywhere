import {
	supportsColor,
	supportsBorderRadius,
	supportsBorder,
	supportsTypography,
	supportsDisplayTypes,
	supportsDimensions,
} from './block-features.js';

const defaultBlockElementSupports = [
	...supportsColor,
	...supportsTypography,
	...supportsDimensions,
];

const supports = {
	div: [
		...defaultBlockElementSupports,
		...supportsBorderRadius,
		...supportsBorder,
		...supportsDisplayTypes,
	],
	section: [
		...defaultBlockElementSupports,
		...supportsBorderRadius,
		...supportsBorder,
		...supportsDisplayTypes,
	],
	main: [
		...defaultBlockElementSupports,
		...supportsBorderRadius,
		...supportsBorder,
		...supportsDisplayTypes,
	],
	h1: defaultBlockElementSupports,
	h2: defaultBlockElementSupports,
	h3: defaultBlockElementSupports,
	h4: defaultBlockElementSupports,
	h5: defaultBlockElementSupports,
	h6: defaultBlockElementSupports,
	p: defaultBlockElementSupports,
	img: [ ...supportsBorderRadius, ...supportsBorder ],
};

/**
 * Get the supported properties for a given block.
 *
 * @param {string} tagName The tag name of the block.
 * @return {Array} The supported properties.
 */
export const getBlockSupports = ( tagName ) => {
	return supports[ tagName.toLowerCase() ] || [];
};

/**
 * Depending on the property and the tag, we might want to ignore zero values.
 * For example: margin: 0px is irrelevant on a DIV but relevant on a P or H1.
 *
 * @param {string} tagName  The tag name of the block.
 * @param {string} property The property to check.
 * @param {string} value    The value of the property.
 * @return {boolean} Whether the property should be ignored.
 */
export const shouldIgnore = ( tagName, property, value ) => {
	const mapping = {
		div: [
			...supportsBorderRadius,
			...supportsBorder,
			...supportsDimensions,
		],
		section: [
			...supportsBorderRadius,
			...supportsBorder,
			...supportsDimensions,
		],
		main: [
			...supportsBorderRadius,
			...supportsBorder,
			...supportsDimensions,
		],
	};

	const isZeroValue = value === '0' || value === '0px';

	const relevantProperties = mapping[ tagName.toLowerCase() ] || [];

	return relevantProperties.includes( property ) && isZeroValue;
};
