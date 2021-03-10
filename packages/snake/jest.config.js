const path = require('path')

const filePath = path.resolve(__dirname, './tsconfig.json')
module.exports = {
    preset: 'ts-jest',
    globals: {
        'ts-jest': {
            diagnostics: false,
            tsconfig: filePath,
        },
    },
    browser: false,
    testPathIgnorePatterns: ['/node_modules/', 'test/', 'build/', 'workers/'],
};
