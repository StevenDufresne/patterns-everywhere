/* global chrome */

import {
	setToggleState,
	setToggleView,
	togglePlugin,
	getToggleState,
} from './utils.js';

chrome.action.onClicked.addListener( () => {
	getToggleState( ( isEnabled ) => {
		setToggleView( isEnabled );
		togglePlugin( isEnabled );

		// Flip the state and save it
		setToggleState( ! isEnabled );
	} );
} );
