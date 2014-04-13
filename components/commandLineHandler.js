/*
 * commandLineHandler.js
 * 
 * Implements a nsICommandLineHandler.
 * The handler will react to .eml files with the included header "X-Unsent: 1"
 *
 * Version: 1.0.0pre1 (12 April 2014)
 * 
 * Copyright (c) 2014 Philippe Lieser
 * 
 * This software is licensed under the terms of the MIT License.
 * 
 * The above copyright and license notice shall be
 * included in all copies or substantial portions of the Software.
 */

// options for JSHint
/* jshint strict:true, moz:true, smarttabs:true */
/* jshint unused:true */ // allow unused parameters that are followed by a used parameter.
/* global Components, Services,  XPCOMUtils, MailServices */
/* global Logging */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

// CHANGEME: generate a unique ID
const CLASS_ID = Components.ID("B19288D8-C285-11E3-9E49-91FC1C5D46B0");
// const CLASS_NAME = "xUnsentCLH";
const CLASS_DESCRIPTION = "X-Unsent support commandline handler";
// CHANGEME: change the type in the contractID to be unique to your application
const CONTRACT_ID = "@pl/X-Unsent_support/clh;1";
// CHANGEME:
// category names are sorted alphabetically. Typical command-line handlers use a
// category that begins with the letter "m".
const CLD_CATEGORY = "m-xUnsent";
// CHANGEME: to the chrome URI of your extension or application
// const CHROME_URI = "chrome://myapp/content/";
const RESOURCE_URI = "resource://xUnsent_support/";

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource:///modules/mailServices.js");

Cu.import(RESOURCE_URI+"logging.jsm");


// the messenger instance
let messenger;
let msgWindow;
let log = Logging.getLogger("clh");

/**
 * Utility functions
 */
 
/**
 * parse the message header
 *
 * @param {String} header
 * 
 * @return {Object}
 */
function parseHeader(header) {
	"use strict";

	let headerFields = {};

	// split header fields
	let headerArray = header.split(/\r\n(?=\S|$)/);
	let hName;
	for(let i = 0; i < headerArray.length; i++) {
		// store fields under header field name (in lower case) in an array
		hName = headerArray[i].match(/\S+(?=\s*:)/);
		if (hName !== null) {
			hName = hName[0].toLowerCase();
			if (headerFields[hName] === undefined) {
				headerFields[hName] = [];
			}
			headerFields[hName].push(headerArray[i]+"\r\n");
		}
	}
	
	return headerFields;
}

/**
 * reads the message and parses the header
 * 
 * @param {String} msgURI
 * 
 * @return {???}
 */
function parseMsg(msgURI) {
	"use strict";

	let headerPlain = "";
	let c;

	// get inputStream for msg
	let messageService = messenger.messageServiceFromURI(msgURI);
	let nsIInputStream = Cc["@mozilla.org/network/sync-stream-listener;1"].
		createInstance(Ci.nsIInputStream);
	let inputStream = Cc["@mozilla.org/scriptableinputstream;1"].
		createInstance(Ci.nsIScriptableInputStream);
	inputStream.init(nsIInputStream);
	messageService.CopyMessage(msgURI, nsIInputStream, false, null /* aUrlListener */, null /* aMsgWindow */, {});
	
	// read header
	while(true) {
		// read one character
		c = inputStream.read(1);
		
		// control char reached
		if (c === "\r" || c === "\n") {
			c = c+inputStream.read(1);
			
			if (c === "\r\n") {
				// CRLF ending
				headerPlain += c;
				c = inputStream.read(2);
				if (c === "\r\n") {
					// empty line found, stop
					break;
				}
			} else {
				// CR or LF ending
				if (c === "\r\r" || c === "\n\n") {
					// empty line found, stop
					break;
				}
			}
		}
		
		headerPlain += c;
	}

	// close inputStream
	inputStream.close();
	nsIInputStream.close();
	
	return parseHeader(headerPlain);
}


// Command Line Handler
function CommandLineHandler() {
}

CommandLineHandler.prototype = {
	classDescription: CLASS_DESCRIPTION,
	classID: CLASS_ID,
	contractID: CONTRACT_ID,
	_xpcom_categories: [{
		category: "command-line-handler",
		entry: CLD_CATEGORY
	}],

	QueryInterface: XPCOMUtils.generateQI([
		Ci.nsICommandLineHandler
	]),

	inicalized: false,
	/**
	 * init
	 *
	 * @return {Boolean} true successful initialized
	 */
	init : function CommandLineHandler_init() {
		"use strict";

		if (!this.inicalized) {
			let _window;
			
			// is a window already open? then use it
			_window = Services.wm.getMostRecentWindow(null);
			if (!_window) {
				log.debug("no window found");
				// TODO: creating own window still bugged
				return false;

				// otherwise create one
				
				// let argstring = Cc["@mozilla.org/supports-string;1"]
					// .createInstance(Ci.nsISupportsString);
				// _window = Services.ww.openWindow(null, "chrome://messenger/content/", "_blank",
					// "chrome,dialog=no,all", argstring);
				
				// window = Services.ww.openWindow(null,
					// "chrome://messenger/content/messengercompose/messengercompose.xul",
					// "_blank", "chrome,dialog=no,all", argstring);

				log.debug("window created");
			}

			// has the window a msgWindow? then use it
			msgWindow = _window.msgWindow;
			if (!messenger) {
				// otherwise create one
				msgWindow = Cc["@mozilla.org/messenger/msgwindow;1"]
					.createInstance(Components.interfaces.nsIMsgWindow);

				log.debug("msgWindow created");
			}
			
			// has the window a messenger? then use it
			messenger = _window.messenger;
			if (!messenger) {
				log.debug("no messenger found");
				// TODO: creating own messenger still bugged
				return false;

				// otherwise create one
				messenger = Cc["@mozilla.org/messenger;1"]
					.createInstance(Components.interfaces.nsIMessenger);
				// the need to set a window, otherwise msgHdrFromURI throws a NS_ERROR_FAILURE
				messenger.setWindow(_window, msgWindow);
				
				log.debug("messenger created");
			}
			
			log.debug("inicalized clh");
			this.inicalized = true;
		}
		
		return this.inicalized;
	},
	
	/* nsICommandLineHandler */
	handle : function clh_handle(cmdLine)
	{
		"use strict";

		let uri;
		
		// most copied from
		// https://mxr.mozilla.org/comm-central/source/mail/components/nsMailDefaultHandler.js
		
		// The URI might be passed as the argument to the file parameter
		uri = cmdLine.handleFlagWithParam("file", false);

		let count = cmdLine.length;
		let i;
		if (count) {
			i = 0;
			while (i < count) {
				let curarg = cmdLine.getArgument(i);
				if (!curarg.startsWith("-"))
					break;

				log.debug("Warning: unrecognized command line flag " + curarg + "\n");
				// To emulate the pre-nsICommandLine behavior, we ignore the
				// argument after an unrecognized flag.
				i += 2;
				// xxxbsmedberg: make me use the console service!
			}

			if (i < count) {
				uri = cmdLine.getArgument(i);

				// mailto: URIs are frequently passed with spaces in them. They should be
				// escaped into %20, but we hack around bad clients, see bug 231032
				if (uri.startsWith("mailto:")) {
					// we do not handle mailto:
					return;
				}
			}
		}

		if (uri) {
			if (uri.toLowerCase().endsWith(".eml")) {
				// inint clh
				if (!this.init()) {
					log.error("init failed");
					return;
				}
				
				// Open this eml in a new message window
				let file = cmdLine.resolveFile(uri);
				// No point in trying to open a file if it doesn't exist or is empty
				if (file.exists() && file.fileSize > 0) {
					// Get the URL for this file
					let fileURL = Services.io.newFileURI(file)
						.QueryInterface(Components.interfaces.nsIFileURL);
					fileURL.query = "?type=application/x-message-display";

					try {
						let msgURI = fileURL.spec;
						let msgHdr = messenger.msgHdrFromURI(msgURI);

						// get headers
						let header = parseMsg(msgURI);
						// only continue if X-Unsent header is set to 1
						let x = header["x-unsent"][0];
						if (x.substr(x.indexOf(":")+1).trim() !== "1") {
							return;
						}
						
						MailServices.compose.OpenComposeWindow(
							null, // string msgComposeWindowURL
							msgHdr, // nsIMsgDBHdr msgHdr
							msgURI, // string originalMsgURI
							Components.interfaces.nsIMsgCompType.Draft,
							Components.interfaces.nsIMsgCompFormat.Default,
							null, // nsIMsgIdentity identity
							msgWindow);
					} catch (e) {
						log.error(e);
						return;
					}
				
					// remove argument so it is not handled by nsMailDefaultHandler
					cmdLine.removeArguments(i, i);
					cmdLine.preventDefault = true;
				}
			}
		}
	},

	// CHANGEME: change the help info as appropriate, but
	// follow the guidelines in nsICommandLineHandler.idl
	// specifically, flag descriptions should start at
	// character 24, and lines should be wrapped at
	// 72 characters with embedded newlines,
	// and finally, the string should end with a newline
	// helpInfo : "  -myapp               Open My Application\n" +
	           // "  -viewapp <uri>       View and edit the URI in My Application,\n" +
	           // "                       wrapping this description\n"
};

var NSGetFactory = XPCOMUtils.generateNSGetFactory([CommandLineHandler]);