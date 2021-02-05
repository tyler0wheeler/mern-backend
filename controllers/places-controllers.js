
const uuid = require('uuid').v4;
const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error')
const getCoordsForAddress = require('../util/location')


let DUMMY_PLACES = [
    {
        id:'p1',
        title: 'Empire State Build',
        description: 'One of the most famous buildings in the world',
        imageUrl: 'https://newyorkyimby.com/wp-content/uploads/2020/09/DSCN0762-777x1036.jpg',
        address: '20 W 34th St, New York, NY 10001',
        location: {
            lat: 40.7484405,
            lng: -73.9878584
        },
        creator: 'u1'

    },
    {
        id:'p2',
        title: 'Emp State Build',
        description: 'One of the most famous buildings in the world',
        imageUrl: 'https://newyorkyimby.com/wp-content/uploads/2020/09/DSCN0762-777x1036.jpg',
        address: '20 W 34th St, New York, NY 10001',
        location: {
            lat: 40.7484405,
            lng: -73.9878584
        },
        creator: 'u2'

    }
]

const getPlaceById = (req, res, next) => {
    const placeId = req.params.pid
    const place = DUMMY_PLACES.find(p => {
        return p.id === placeId
    })
    if(!place) {
        return next(new HttpError('Could not find a place for the provided id'))
    } 
    res.json({place})
}

const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.uid
    const places = DUMMY_PLACES.filter(place => {
        return place.creator === userId
    })
    if(!places || places.length === 0) {
        return next(new HttpError('Could not find a place for the provided user id'))
    } 
    res.json({places})
}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        return next(new HttpError('Invalid inputs passed.  please check your data', 422))
    }
    const { title, description, address, creator } = req.body;

    let coordinates;
    try{
        coordinates = await getCoordsForAddress(address)
    } catch (error) {
         return next(error)
    }

    const createdPlace = {
        id: uuid(),
        title: title,
        description: description,
        location: coordinates,
        address: address,
        creator: creator
    }
    DUMMY_PLACES.push({createdPlace})
    res.status(201).json({place: createdPlace})
}

const updatePlace = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        throw new HttpError('Invalid inputs passed.  please check your data', 422)
    }
    const { title, description} = req.body;
    const placeId = req.params.pid

    const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) };
    const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);
    updatedPlace.title = title;
    updatedPlace.description = description

    DUMMY_PLACES[placeIndex] = updatedPlace

    res.status(200).json({place: updatedPlace})
}

const deletePlace = (req, res, next) => {
    const placeId = req.params.pid
    if(!DUMMY_PLACES.find(p => p.id === placeId)){
        throw new HttpError('Could not find a place for that id', 404)
    }
    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId)
    res.status(200).json({message: `Deleted place with id ${placeId}`})
}


exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace