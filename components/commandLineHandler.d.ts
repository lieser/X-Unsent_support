declare module browser {
	declare module commandLineHandler {
		const init: () => Promise<void>;
	}
}

class nsDummyMsgHeader implements  { }
