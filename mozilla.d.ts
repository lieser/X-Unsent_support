interface ChromeUtils {
	readonly generateQI: (interfaces: nsISupports[]) => any;
	readonly import(url: string): any;
}
declare const ChromeUtils: ChromeUtils;

declare module Components {
	const classes: { readonly [key: string]: nsIJSCID };
	const interfaces: ComponentsInterfaces;
	const manager: nsIComponentRegistrar

	const ID: (id: string) => nsCIDRef;

	interface ComponentsInterfaces {
		[key: string]: object;
		readonly nsICommandLineHandler: nsICommandLineHandler;
		readonly nsIFileURL: nsIFileURL;
		readonly nsIInputStream: nsIInputStream;
		readonly nsIMessenger: nsIMessenger;
		readonly nsIMsgCompFormat: nsIMsgCompFormat;
		readonly nsIMsgCompType: nsIMsgCompType;
		readonly nsIMsgWindow: nsIMsgWindow;
		readonly nsIObserverService: nsIObserverService;
		readonly nsIScriptableInputStream: nsIScriptableInputStream;
	}
}

declare module ExtensionCommon {
	interface Extension {
		readonly callOnClose: (obj: object) => void;
		readonly localeData: {
			localizeMessage: (
				messageName: string,
				substitutions?: undefined | string | (string | string[])[]
			) => string;
		};
		readonly messageManager: {
			readonly convert: (msgDBHdr: nsIMsgDBHdr) => browser.messageDisplay.MessageHeader;
			readonly get: (messageId: number) => nsIMsgDBHdr;
		};

		readonly id: string;
		readonly rootURI: nsIURI;
	}

	declare class ExtensionAPI implements ExtensionApiI {
		constructor(extension: Extension);

		readonly extension: Extension;
	}

	interface Context {
		readonly extension: Extension;
		readonly callOnClose: (obj: object) => void;
	}
}

/** JavaScript code module "resource:///modules/MailServices.jsm" */
declare module MailServicesM {
	declare module compose {
		const OpenComposeWindow: (
			msgComposeWindowURL: string,
			msgHdr: nsIMsgDBHdr,
			originalMsgURI: string,
			type: number,
			format: number,
			identity: nsIMsgIdentity,
			from: string,
			aMsgWindow: nsIMsgWindow,
			suppressReplyQuote?: boolean,
		) => void;
	}

}

/** JavaScript code module "resource:///modules/MailUtils.jsm" */
declare module MailUtilsM {
	const getIdentityForHeader: (hdr: nsIMsgDBHdr, type: number, hint?: string) => [nsIMsgIdentity, never];
}

/** JavaScript code module "resource://gre/modules/Services.jsm" */
declare module ServicesM {
	const catMan: nsICategoryManager;
	const io: nsIIOService;
	const prefs: nsIPrefService;
}

/** JavaScript code module "resource://gre/modules/XPCOMUtils.jsm" */
declare module XPCOMUtilsM {
	const generateNSGetFactory: (components: nsISupports[]) => ((nsIXPCComponents_ID) => nsIFactory);
}


interface nsICategoryManager {
	readonly addCategoryEntry: (aCategory: string, aEntry: string, aValue: string, aPersist: false, aReplace: boolean) => void;
	readonly deleteCategoryEntry: (aCategory: string, aEntry: string, aPersist: false) => void;
}

interface nsICommandLine {
	readonly length: number;

	preventDefault: boolean;

	readonly getArgument: (aIndex: number) => string;
	readonly findFlag: (aFlag: string, aCaseSensitive: boolean) => number;
	readonly removeArguments: (aStart: number, aEnd: number) => void;
	readonly resolveFile: (aArgument: string) => nsIFile;
}

interface nsICommandLineHandler extends nsISupports {
	readonly handle: (aCommandLine: nsICommandLine) => void;
	readonly helpInfo: string;
}

interface nsIComponentRegistrar {
	readonly registerFactory: (aClass: nsCIDRef, aClassName: string, aContractID: string, aFactory: nsIFactory) => void;
	readonly unregisterFactory: (aClass: nsCIDRef, aFactory: nsIFactory) => void;
}

interface nsIFactory { nsIFactory: never }

interface nsIFile {
	readonly fileSize: number;

	readonly exists: () => boolean;
	readonly initWithPath: (filePath: string) => void;
}

interface nsIFileURL extends nsIURL {
	readonly mutate: () => nsIURIMutator<nsIFileURL>;
}

interface nsIInputStream extends nsIStreamListener {
	readonly available(): number;
	readonly close(): void;
	readonly isNonBlocking(): boolean;
}

interface nsIIOService {
	readonly newURI(aSpec: string, aOriginCharset: string | null, aBaseURI: nsIURI | null): nsIURI;
	readonly newFileURI: (aFile: nsIFile) => nsIURI;
}

interface nsIJSCID {
	readonly createInstance(): nsISupports;
	readonly createInstance<nsIIDRef>(uuid: nsIIDRef): nsIIDRef;
	readonly getService: <nsIIDRef>(uuid: nsIIDRef) => nsIIDRef;
}

interface nsIMessenger {
	readonly messageServiceFromURI: (aUri: string) => nsIMsgMessageService;
}

interface nsIMsgCompFormat {
	readonly Default: 0;
	readonly HTML: 1;
	readonly PlainText: 2;
	readonly OppositeOfDefault: 3;
}

interface nsIMsgCompType {
	readonly New: 0;
	readonly Reply: 1;
	readonly ReplyAll: 2;
	readonly ForwardAsAttachment: 3;
	readonly ForwardInline: 4;
	readonly NewsPost: 5;
	readonly ReplyToSender: 6;
	readonly ReplyToGroup: 7;
	readonly ReplyToSenderAndGroup: 8;
	readonly Draft: 9;
	readonly Template: 10;  // New message from template.
	readonly MailToUrl: 11;
	readonly ReplyWithTemplate: 12;
	readonly ReplyToList: 13;
	readonly Redirect: 14;
	readonly EditAsNew: 15;
	readonly EditTemplate: 16;
	readonly ReplyIgnoreQuote: 100;
}

interface nsIMsgDBHdr {
	author: string;
}

interface nsIMsgIdentity { nsIMsgIdentity: never }

interface nsIMsgMessageService {
	readonly CopyMessage: (aSrcURI: string, aCopyListener: nsIStreamListener, aMoveMessage: boolean, aUrlListener: nsIUrlListener, aMsgWindow: nsIMsgWindow, aURL: nsIMsgMessageService_out_url) => void;
}

interface nsIMsgMessageService_out_url {
	value?: nsIURI;
}

interface nsIMsgWindow { nsIMsgWindow: never }

interface nsIPrefService {
    getBranch(aPrefRoot: string): nsIPrefBranch;
}

interface nsIPrefBranch {
    addObserver(aDomain: string, aObserver: nsIObserver, aHoldWeak: boolean);
    clearUserPref(aPrefName: string);
    getBoolPref(aPrefName: string, aDefaultValue?: boolean): boolean;
    getCharPref(aPrefName: string, aDefaultValue?: string): string;
    getChildList(aStartingAt: string, aCount?: { value?: number }): string[];
    getIntPref(aPrefName: string, aDefaultValue?: number): number;
    getPrefType(aPrefName: string): number;
    prefHasUserValue(aPrefName: string): boolean;
    setIntPref(aPrefName: string, aValue: number);
    removeObserver(aDomain: string, aObserver: nsIObserver);
    readonly PREF_INVALID: number;
    readonly PREF_STRING: number;
    readonly PREF_INT: number;
    readonly PREF_BOOL: number;
}

interface nsIScriptableInputStream {
	readonly close: () => void;
	readonly init: (aInputStream: nsIInputStream) => void;
	readonly read: (aCount: number) => string;
}

interface nsIStreamListener { nsIStreamListener: never }

interface nsISupports {
	readonly QueryInterface: <nsIIDRef>(uuid: nsIIDRef) => nsIIDRef;
}

interface nsIURI extends nsISupports {
	readonly spec: string;

	readonly mutate: () => nsIURIMutator<nsIURI>;
}

interface nsIURIMutator<T extends nsIURI> {
	readonly finalize: () => T;
	readonly setQuery: (aQuery: string) => nsIURIMutator<T>;
}

interface nsIURL extends nsIURI { nsIURL: never }

interface nsIUrlListener { nsIUrlListener: never }

interface nsCIDRef extends nsISupports { nsCIDRef: never }
