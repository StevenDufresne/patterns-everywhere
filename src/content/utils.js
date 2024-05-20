/**
 * Add hover styles for the element.
 * @param {HTMLElement} element
 */
export const addStyle = ( element ) => {
	if ( ! ( element instanceof HTMLElement ) ) {
		return;
	}
	element.style.outline = '1px solid black';
	element.style.cursor = 'default';
};

/**
 * Remove hover styles for the element.
 * @param {HTMLElement} element
 */
export const removeStyle = ( element ) => {
	if ( ! ( element instanceof HTMLElement ) ) {
		return;
	}
	element.style.outline = '';
	element.style.cursor = 'initial';
};

/**
 * Copy the element and its content to the clipboard.
 */
export const displayConfirmationMessage = () => {
	const message = document.createElement( 'div' );
	message.style.position = 'fixed';
	message.style.top = '0';
	message.style.left = '0';
	message.style.width = '100%';
	message.style.height = '100%';
	message.style.backgroundColor = 'rgba(56, 88, 233, 0.75)';
	message.style.color = 'white';
	message.style.fontSize = '2em';
	message.style.display = 'flex';
	message.style.justifyContent = 'center';
	message.style.alignItems = 'center';
	message.style.zIndex = '999999';
	message.innerText = 'Element copied to clipboard!';
	document.body.appendChild( message );

	setTimeout( () => {
		document.body.removeChild( message );
	}, 400 );
};
