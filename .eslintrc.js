module.exports = {
    'env': {
        'browser': true,
        'es6': true
    },
    'extends': 'eslint:recommended',
    'parser': 'babel-eslint',
    'parserOptions': {
        'sourceType': 'module'
    },
    'rules': {
        'indent': [
            'error',
            2
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'no-unused-vars': [
          'error',
          { 'args': 'all', 'argsIgnorePattern': '^_' }
        ],
        'no-var': 'error',
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'never'
        ]
    },
    'plugins': [
        'flowtype'
    ]
};
