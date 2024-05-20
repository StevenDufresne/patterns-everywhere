module.exports = {
	transform: {
		'^.+\\.jsx?$': 'babel-jest', // Transform JavaScript files using babel-jest
	},
	setupFiles: [ './jest.setup.js' ], // Add this line
};
