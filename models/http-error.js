class HttpError extends Error {
    constructor(message, errorCode) {
        super(message);  //Add a messgae property
        this.code = errorCode
    }
}

module.exports = HttpError