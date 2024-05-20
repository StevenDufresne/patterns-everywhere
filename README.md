# Patterns Everywhere

This is the repository for a chrome extension that allow users to copy HTML and paste it into Gutenberg. 

It is composed of 3 main parts:
- `/background` The service worker.
- `/content` The functionality that copies the HTML and formats it for pasting.
- `/wp-editor-modifications` Some modifications that run when using the block editor to make copy/pasting possible.


## Setup
### Scripts
1. `npm install` Install dependencies.
1. `npm build` Compiles JavaScript into `build` folder.
1. `npm test` Run test suites.

## Project Structure
### `/background`

In Chrome extensions, the service worker, introduced with Manifest V3, acts as a background script that runs independently of the extension's UI. It handles various background tasks such as event handling, network request management, alarms, and inter-component communication, while being more efficient and secure than the previous background pages. Service workers are event-driven and activate only when needed, which conserves resources and improves performance. This shift enhances the reliability, efficiency, and security of Chrome extensions.
 
### `/content`

This is the Interface for copying HTML and adding it to the clipboard.

### `/wp-editor-modifications`

Ideally these modifications would ship with Gutenberg in the future but since this is still experimental, this plugin is loaded when viewing the block editor and we register a block so we can handle `raw` transforms. In the future, it would be more ideal to ship this in Gutenberg closer to the [source code](https://github.com/WordPress/gutenberg/tree/1240294d1c81bf50bd9383b7f1973cc16fa13a4a/packages/blocks/src/api/raw-handling).

### IMPORTANT

Gutenberg currently has a `divNormaliser` that won't allow this to work. You can view the source [here](https://github.com/WordPress/gutenberg/blob/1240294d1c81bf50bd9383b7f1973cc16fa13a4a/packages/blocks/src/api/raw-handling/paste-handler.js#L195). Until we can make this configurable, you'll need to run this project on a local version of gutenberg that has this removed.

## How to install this extension on your computer
### Open Chrome Extensions Page:
Open Google Chrome and go to the extensions page by either:

- Typing chrome://extensions/ in the address bar, or
- Clicking the three-dot menu in the top-right corner, selecting "More tools," and then "Extensions."

### Enable Developer Mode:

On the extensions page, toggle the "Developer mode" switch in the top-right corner to enable developer mode. This will allow you to load unpacked extensions.

### Load Unpacked Extension:

Once developer mode is enabled, three new buttons will appear near the top of the page: "Load unpacked," "Pack extension," and "Update."

- Click the "Load unpacked" button.
- In the file dialog that opens, navigate to the directory where your extension files are located and select it.