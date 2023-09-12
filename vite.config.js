// export default {
//     // config options
//     base: '/colorful-case-study-desktop/'
// }


const path = require('path')

export default {
    root: path.resolve(__dirname, 'src'),
    build: {
        outDir: '../dist'
    },
    base: '/HOH_explore_mobile/',
    server: {
        port: 8080
    }
}