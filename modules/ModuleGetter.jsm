/*
 * ModuleGetter.jsm
 *
 * Module getter for X-Unsent support add-on.
 *
 * Version: 1.0.0 (13 April 2014)
 *
 * Copyright (c) 2014 Philippe Lieser
 *
 * This software is licensed under the terms of the MIT License.
 *
 * The above copyright and license notice shall be
 * included in all copies or substantial portions of the Software.
 */
 
// options for JSHint
/* jshint strict:true, esnext:true */
/* jshint unused:true */ // allow unused parameters that are followed by a used parameter.
/* global Components, Services, XPCOMUtils */
/* exported EXPORTED_SYMBOLS, ModuleGetter */

"use strict";

var EXPORTED_SYMBOLS = [ "ModuleGetter" ];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

const RESOURCE_URI = "resource://xUnsent_support/";

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");


var ModuleGetter = {
	/**
	 * Defines a getter for the Log.jsm module.
	 * 
	 * Gecko 27 and later: "resource://gre/modules/Log.jsm"
	 * Gecko 24-26: "resource://services-common/log4moz.js"
	 * Otherwise: RESOURCE_URI+"mozilla/log4moz.js"
	 * 
	 * @param {Object} aObject The object to define the lazy getter on.
	 * @param {String} [aName="Log"] The name of the getter to define on aObject for the module.
	 */
	getLog: function ModuleGetter_getLog(aObject, aName="Log"){
		XPCOMUtils.defineLazyGetter(aObject, aName, function () {
			try {
				var temp = {};
				
				if (Services.vc.compare(Services.appinfo.platformVersion, "27.0-1") >= 0) {
					Cu.import("resource://gre/modules/Log.jsm", temp);
				} else if (Services.vc.compare(Services.appinfo.platformVersion, "24.0-1") >= 0) {
					Cu.import("resource://services-common/log4moz.js", temp);
				} else {
					Cu.import(RESOURCE_URI+"mozilla/log4moz.js", temp);
				}
				
				return temp.Log || temp.Log4Moz;
			} catch (e) {
				Cu.reportError(e);
			}
		});
	},
};
