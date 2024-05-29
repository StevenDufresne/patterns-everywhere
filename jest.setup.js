/* eslint-disable no-undef */

// We need this when running jest test in the context of the browser.
import { TextDecoder, TextEncoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

global.chrome = {
	runtime: {
		onMessage: {
			addListener: jest.fn(), // eslint-disable-line no-undef
		},
	},
};

global.HTMLElement = class {};

// Patch JSDOM with window.matchMedia
Object.defineProperty( window, 'matchMedia', {
	writable: true,
	value: jest.fn().mockImplementation( ( query ) => ( {
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(), // Deprecated
		removeListener: jest.fn(), // Deprecated
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	} ) ),
} );
