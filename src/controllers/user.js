const db = require('../models')
const {v4} = require('uuid')
const bcrypt = require('bcryptjs')
const genToken = require('../middleware/genToken')
const sendEmailHandler = require('./mail')
const jwt = require('jsonwebtoken')
const generatePassword = require('../middleware/genPassword')


const hashPassword = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10))

const login = async(req, res) => {
    try {
        const ENLNG = req.headers.language == 'en'
        const formData = req.body
        let message

        if(!formData.account || !formData.password){
            return res.status(400).json({
                error: true,
                message: ENLNG?"Missing account or password":"Chưa đầy đủ thông tin"
            })
        }

        const response = await db.user.findOne({
            where: {email: formData.account},
            raw: true
        })

        const isCorrectPassword = response && bcrypt.compareSync(formData.password, response?.password)

        if (response) {
            delete response.password
        }
        if(response){
            if(isCorrectPassword){
                message = ENLNG?"Login succesfull":"Đăng nhập thành công"
            }else{
                message = ENLNG?"Wrong password":"Sai mật khẩu"
            }
        }else{
            message = ENLNG?"Account is not found":"Không tìm thấy tài khoản"
        }

        const token = isCorrectPassword && genToken(response.id,formData.remember?"30d":"1d")

        return res.status(200).json({
            error: token ? false : true,
            message: message,
            token: token ? `Bearer ${token}` : null,
            dataCurrent: token ? response : null
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "SERVER: "+error.message
        })
    }
}

const register = async(req, res) => {
    try {
        const ENLNG = req.headers.language == 'en'
        const formData = req.body
        let message
        
        if(!formData.account || !formData.password){
            return res.status(400).json({
                error: true,
                message: ENLNG?"Missing account or password":"Chưa đầy đủ thông tin"
            })
        }
        
        const response = await db.user.findOrCreate({
            where: {email: formData.account},
            defaults: {
                email: formData.account,
                name: formData.account.split("@")[0],
                id: v4(),
                userId: v4(),
                password: hashPassword(formData.password),
                typeLogin: 'Local',
            }
        })
        if(response[1]){
            message = ENLNG?"Registed succesfull, please login":"Đăng ký thành công, vui lòng đăng nhập"
        }else {
            message = ENLNG?"Email has been registered":"Tài khoản đã bị đăng ký"
        }
        
        return res.status(200).json({
            error: response[1]?true:false,
            message: message
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "SERVER: "+error
        })
    }
}

const verifyEmail = async(req, res) => {
    try {
        const ENLNG = req.headers.language == 'en'
        const email = req.body.account
        const response = await db.user.findOne({
            where: {email: email},
            raw: true
        })
        if(!response){
            return res.status(200).json({
                error: true,
                message: ENLNG?"Account is not found":"Không tìm thấy tài khoản"
            })
        }else{
            const emailMessage = {
                from: 'ICN lab/AlanDinh',
                to: email,
                subject: ENLNG?"Confirm password change":"Xác nhận thay đổi mật khẩu",
                html: ENLNG?`<h3>Hello ${response?.name || email},</h3>
                <p>We received a request to forget your account password. If it is you, please click on the attached link to confirm.</p>
                <p>If it's not you, we'd like to notify you that someone else is trying to access your account.</p>
                <a href="${process.env.SERVER_PATH}/auth/email-forget?token=${genToken(response.id,"300s")}">Select to agree to change the password
                </a>
                <br />
                <br />
                <b>Best regards,</b>
                <br />
                <b>ICN lab</b>`
                :`<h3>Xin chào ${response?.name || email},</h3>
                <p>Chúng tôi nhận được yêu cầu quên mật khẩu tài khoản của bạn. Nếu đó là bạn hãy bấm vào link đính kèm để xác nhận.</p>
                <p>Nếu không phải bạn, chúng tôi muốn thông báo có ai đó đang cố gắng truy cập và tài khoản của ban.</p>
                <a href="${process.env.SERVER_PATH}/auth/email-forget?token=${genToken(response.id,"300s")}">Click here đồng ý đổi mật khẩu</a>
                <br />
                <br />
                <b>Trân trọng,</b>
                <br />
                <b>ICN lab</b>`,
            }
            await sendEmailHandler(emailMessage)

            return res.status(200).json({
                error: false,
                message: ENLNG?"Please check your email to verify account":"Vui lòng kiểm tra email để xác thực tài khoản"
            })
        }
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "SERVER: "+error.message
        })
    }
}

const emailForget = async(req, res) => {
    try {
        const ENLNG = req.headers.language == 'en'
        jwt.verify(req.query.token, process.env.SECRET_KEY_JWT, async(err, decode) => {
            if (!err) {
                const id = decode.id
                var response = await db.user.findOne({
                    where: {id}
                })
                if(!response){
                    return res.status(200).json({
                        error: true,
                        message: ENLNG?"Account is not found":"Không tìm thấy tài khoản"
                    })
                }else{
                    let newPassword = generatePassword(8)
                    response.password = hashPassword(newPassword)
                    const emailMessage = {
                        from: 'ICN lab/AlanDinh',
                        to: response?.email,
                        subject: ENLNG?"New password infomation":"Thông tin mật khẩu mới",
                        html: ENLNG?`<h3>Hello ${response?.name || response?.email},</h3>
                        <p>We have received confirmation for your account.</p>
                        <p>If it's not you, we'd like to notify you that someone else is trying to access your account.</p>
                        <p><strong>Your current password is: ${newPassword}</strong></p>
                        <p>Please preceed to change your password after logging in to ensure security</p>
                        <br />
                        <br />
                        <b>Best regards,</b>
                        <br />
                        <b>ICN lab</b>`
                        :`<h3>Xin chào ${response?.name || response?.email},</h3>
                        <p>Chúng tôi đã nhận được xác nhận cho tài khoản của bạn.</p>
                        <p>Nếu không phải bạn, chúng tôi muốn thông báo có ai đó đang cố gắng truy cập và tài khoản của ban.</p>
                        <p><strong>Mật khẩu hiện tại của bạn là: ${newPassword}</strong></p>
                        <p>Vui lòng tiến hành thay đổi mật khẩu sau khi đăng nhập để đảm bảo an toàn.</p>
                        <br />
                        <br />
                        <b>Trân trọng,</b>
                        <br />
                        <b>ICN lab</b>`,
                    }
                    await sendEmailHandler(emailMessage)
                    await response.save()

                    return res.status(200).json({
                        error: false,
                        message: "successfull"
                    })
                }
            }else{
                return res.status(400).json({
                    error: true,
                    message: err
                })
            }
        })
        
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "SERVER: "+error.message
        })
    }
}

const changePassword = async(req, res) => {
    try {
        const ENLNG = req.headers.language == 'en'
        const formData = req.body

        const id = req.user?.id
        const response = await db.user.findOne({
            where: {id}
        })

        if(formData.name){
            response.name = formData.name
        }
        if(formData.newPassword){
            const isCorrectPassword = bcrypt.compareSync(formData.currentPassword, response?.password)
            if(!isCorrectPassword){
                return res.status(400).json({
                    error: true,
                    message: ENLNG?"Wrong password":"Sai mật khẩu"
                })
            }
            response.password = hashPassword(newPassword)
        }
        await response.save()

        return res.status(200).json({
            error: false,
            message: ENLNG?"Update successful":"Cập nhật thành công"
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "SERVER: "+error.message
        })
    }
}

module.exports = {login, register, verifyEmail, emailForget, changePassword}