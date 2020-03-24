const hostMap = {
    test: 'https://gateway-test.100daishu.com/business',
    development: 'https://gateway-test.100daishu.com/business',
    production: 'https://gateway.100daishu.com/business',
    simulation: 'https://gateway-pre.100daishu.com/business'
}

const host = hostMap[process.env.NODE_ENV]

export default host;