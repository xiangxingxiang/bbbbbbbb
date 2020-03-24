const hostMap = {
    development: 'http://zxxb-system-dev.100daishu.com',
    production: 'https://zxxb-system.100daishu.com',
    simulation: 'http://zxxb-system-pre.100daishu.com',
    test: 'http://zxxb-system-test.100daishu.com'
}

const host = hostMap[process.env.NODE_ENV]

export default host;