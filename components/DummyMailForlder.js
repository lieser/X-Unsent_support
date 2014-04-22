/*
 * DummyMailForlder.js
 * 
 * Implements a nsIMsgFolder.
 *
 * Version: 0.1.0 (21 April 2014)
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
/* global Components, XPCOMUtils */
/* global Logging */
/* exported NSGetFactory */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

// a unique ID
const CLASS_ID = Components.ID("078914AE-6DDE-481E-B020-7005C0DCBB02");
// const CLASS_NAME = "xUnsentCLH";
const CLASS_DESCRIPTION = "mailboxDummy";
// id must be unique in application
const CONTRACT_ID = "@mozilla.org/rdf/resource-factory;1?name=mailboxDummy";
// category names are sorted alphabetically. Typical command-line handlers use a
// category that begins with the letter "m".
// const CLD_CATEGORY = "w-xUnsent";
// const CHROME_URI = "chrome://xUnsent_support/content/";
const RESOURCE_URI = "resource://xUnsent_support/";
// const PREF_BRANCH = "extensions.xUnsent_support.";

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource:///modules/mailServices.js");

Cu.import(RESOURCE_URI+"logging.jsm");


let log = Logging.getLogger("dmf");
// var prefs = Services.prefs.getBranch(PREF_BRANCH);

/**
 * Utility functions
 */


/**
 * nsDummyMsgIncomingServer
 * 
 * Rewrites some of the nsIMsgIncomingServer methods.
 * Delegates other calls to a nsIMsgIncomingServer.
 * 
 * @param{nsIMsgIncomingServer} server
 * 
 * @return{nsIMsgIncomingServer}
 */
function nsDummyMsgIncomingServer(server, folder) {
	"use strict";

	// let res = Object.create(server);
	this._folder = folder;
	
	log.debug("nsDummyMsgIncomingServer created");
	// return res;
}
	Object.defineProperties(nsDummyMsgIncomingServer.prototype, {
		// "QueryInterface": {
			// value: XPCOMUtils.generateQI([
				// Ci.nsIMsgFolder,
				// Ci.nsIRDFResource
			// ]),
			// writable: true,
		// },
		"QueryInterface": {
			value: function (iid) {
				log.debug("nsDummyMsgIncomingServer QueryInterface");
				log.debug("iid: "+iid);
				if(!iid.equals(Ci.nsIMsgIncomingServer) && !iid.equals(Ci.nsISupports))
					throw Components.results.NS_ERROR_NO_INTERFACE;
				// this.__proto__.QueryInterface(iid);
				log.debug("nsDummyMsgIncomingServer QueryInterface end");
				return this;
			},
			writable: true,
		},
		/**
		 * return a DummyMailForlder, not a nsIMsgFolder
		 */
		"getMsgFolderFromURI": {
			value: function(aFolderResource, aURI) {
				log.debug("getMsgFolderFromURI nsDummyMsgIncomingServer");
				log.debug("getMsgFolderFromURI - aURI: "+aURI);
				aURI = "mailbox://nobody@Local%20Folders/Templates";

				// let folder = this.__proto__.getMsgFolderFromURI(aFolderResource, aURI);
				// return new DummyMailForlder(folder)
				let res = this._folder || new DummyMailForlder();
				return res;
			},
			writable: true,
		},
	});


/**
 * DummyMailForlder
 * 
 * Rewrites some of the nsIMsgFolder methods.
 * Delegates other calls to a nsIMsgFolder.
 * 
 * @param{nsIMsgIncomingServer} [folder]
 * 
 * @return{nsIMsgIncomingServer}
 */
function DummyMailForlder(folder) {
	"use strict";

	/*
	// if no folder is given create one
	if (!folder) {
		log.debug("DummyMailForlder created mailbox");
		folder = Cc["@mozilla.org/rdf/resource-factory;1?name=mailbox"].
			createInstance(Ci.nsIMsgFolder);
		// query nsIRDFResource interface so that the Init function gets exposed and called
		folder.QueryInterface(Ci.nsIRDFResource);
	}

	let res = Object.create(folder);
	/**/

	this.server = new nsDummyMsgIncomingServer(null, this);
	
	log.debug("DummyMailForlder created");
	// return res;
}
	
DummyMailForlder.prototype.classDescription = CLASS_DESCRIPTION;
DummyMailForlder.prototype.classID = CLASS_ID;
DummyMailForlder.prototype.contractID = CONTRACT_ID;

	Object.defineProperties(DummyMailForlder.prototype, {
		// "QueryInterface": {
			// value: XPCOMUtils.generateQI([
				// Ci.nsIMsgFolder,
				// Ci.nsIRDFResource
			// ]),
			// writable: true,
		// },
		"QueryInterface": {
			value: function (iid) {
				// log.debug("DummyMailForlder QueryInterface");
				// log.debug("iid: "+iid);
				if(!iid.equals(Ci.nsIMsgFolder) &&
					 !iid.equals(Ci.nsIRDFResource) &&
					 !iid.equals(Ci.nsISupports)) {
					throw Components.results.NS_ERROR_NO_INTERFACE;
				}
				// log.debug("DummyMailForlder QueryInterface end");
				return this;
			},
			writable: true,
		},
		"__noSuchMethod__": {
			value: function (id, args) {
				log.debug("noSuchMethod - id: "+id+"; args: (" + args.join(', ') + ')');
			},
			writable: true,
		},
		/*
		"server": {
			// value: new nsDummyMsgIncomingServer(res.__proto__.server),
			value: new nsDummyMsgIncomingServer(),
			writable: true,
		},/**/
		"Init": {
			value: function(URI) {
				log.debug("Init - URI: "+URI);
				// res.__proto__.Init("mailbox://nobody@Local%20Folders/Templates");
			},
			writable: true,
		},
		"setFlag": {
			value: function(x) {
				log.debug("setFlag: "+x);
				// res.__proto__.setFlag(x);
			},
			writable: true,
		},
		"copyFileMessage": {
			value: function dmf_copyFileMessage(/*
				file, // in nsIFile
				msgToReplace, // in nsIMsgDBHdr
				isDraft, // in boolean
				newMsgFlags, // in unsigned long
				msgWindow, // in nsIMsgWindow
				listener // in nsIMsgCopyServiceListener */
			)	{
				log.debug("copyFileMessage");
			},
			writable: true,
		},
	});

var NSGetFactory = XPCOMUtils.generateNSGetFactory([DummyMailForlder]);
