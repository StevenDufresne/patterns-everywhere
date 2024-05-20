global.chrome = {
	runtime: {
		onMessage: {
			addListener: jest.fn(), // eslint-disable-line no-undef
		},
	},
};

global.HTMLElement = class {};
