const userRoute = require('./user')


const initRoutes = (server) => {
    server.use('/api/v1/auth',userRoute)
}

module.exports = initRoutes;
