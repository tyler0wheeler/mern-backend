const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error')
const User = require('../models/user')


const getUsers = async (req, res, next) => {
    let users
    try{
        users = await User.find({}, 'email name') // or '-password'
    } catch (err) {
        const error = new HttpError(
            'Fetching users failed, please try again later', 500
        )
        return next(error)
    }

    res.json({users: users.map(user => user.toObject({getters:true}))})
}

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        return next(new HttpError('Invalid inputs passed.  please check your data', 422))
    }
    const { name, email, password } = req.body

    let existingUser
    try{
        existingUser = await User.findOne({email: email})
    } catch (err) {
        const error = new HttpError(
            'Signup failed, please try again later', 500
        )
        return next(error)
    }

    if(existingUser) {
        const error = new HttpError(
            'User exists already, please login instead', 422
        )
        return next(error)
    }

    const createdUser = new User ({
        name,
        email,
        image: 'https://i.pinimg.com/originals/85/06/96/850696a04c546b55d6854f1f656af6b4.jpg',
        password,
        places: []
    })

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError(
            'Creating user failed.  Please try again',
            500
        )
        return next(error)
    }

    res.status(201).json({user: createdUser.toObject({getters:true})})
}

const login = async (req, res, next) => {
    const { email, password } = req.body

    let existingUser
    try{
        existingUser = await User.findOne({email: email})
    } catch (err) {
        const error = new HttpError(
            'Loggin failed, please try again later', 500
        )
        return next(error)
    }

    if (!existingUser || existingUser.password !== password){
        const error = new HttpError(
            'Ivalid credentials, could not log in', 401
        )
        return next(error)
    }

    
    res.json({message: 'Successfully logged in'})
}

exports.getUsers = getUsers
exports.login = login
exports.signup = signup