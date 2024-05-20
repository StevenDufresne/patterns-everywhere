import {
	addStyle,
	removeStyle,
	displayConfirmationMessage,
} from './utils/interface.js';
import { copyElementAndContent } from './utils/dom.js';

// Constants
const MESSAGE_NAMESPACE = 'PATTERNS_EVERYWHERE';

/**
 * Handle the mouse over event.
 * @param {MouseEvent} event
 */
function onMouseOver( event ) {
	addStyle( event.target );
}

/**
 * Handle the click event.
 * @param {MouseEvent} event
 */
function onClick( event ) {
	copyElementAndContent( event.target, document );
	displayConfirmationMessage();
}

/**
 * Handle the mouse out event.
 * @param {MouseEvent} event
 */
function onMouseOut( event ) {
	removeStyle( event.target );
}

/* global chrome */
chrome.runtime.onMessage.addListener(
	function ( message, sender, sendResponse ) {
		if ( message.sender && message.sender !== MESSAGE_NAMESPACE ) {
			return;
		}

		if ( message.isEnabled ) {
			document.body.addEventListener( 'mouseover', onMouseOver );
			document.body.addEventListener( 'mouseout', onMouseOut );
			document.body.addEventListener( 'click', onClick );
		} else {
			document.body.removeEventListener( 'mouseover', onMouseOver );
			document.body.removeEventListener( 'mouseout', onMouseOut );
			document.body.removeEventListener( 'click', onClick );
		}

		sendResponse( { received: true } );
	}
);
