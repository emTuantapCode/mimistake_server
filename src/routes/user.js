const express = require('express')
const userControler = require('../controllers/user')
const checkToken = require('../middleware/checkToken')

const router = express.Router()

router.post('/local/login', userControler.login)
router.post('/local/register', userControler.register)
router.post('/verify-email', userControler.verifyEmail)
router.get('/email-forget', userControler.emailForget)
router.use(checkToken)
router.post('/local/change-password', userControler.changePassword)

module.exports = router;