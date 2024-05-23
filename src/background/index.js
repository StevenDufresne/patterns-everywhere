/* global chrome */

import {
	setToggleState,
	setToggleView,
	togglePlugin,
	getToggleState,
} from './utils.js';

chrome.action.onClicked.addListener( () => {
	getToggleState( ( currentState ) => {
		setToggleView( ! currentState );
		togglePlugin( ! currentState );

		// Flip the state and save it
		setToggleState( ! currentState );
	} );
} );

chrome.tabs.onUpdated.addListener( function ( tabId, changeInfo ) {
	if ( changeInfo.status === 'complete' ) {
		// Turn off the plugin on page load
		setToggleView( false );
		setToggleState( false );
	}
} );
