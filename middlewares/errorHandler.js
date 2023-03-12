const errorHandler = (error, req, res, next) => {
    let code = 500;
    let message = error.msg || `Internal server error`;
    console.log(error);

    if (
        error.name == "SequelizeValidationError" ||
        error.name == "SequelizeUniqueConstraintError"
    ) {
        error = error.errors[0].message;
        code = 400;
        message = error;
    } else if (error.name == "data not found") {
        code = 404;
        message = `data not found`;
    } else if (error.name == `invalid_credentials`) {
        code = 401;
        message = `invalid email or password`;
    } else if (
        error.name == `invalid token` ||
        error.name == `JsonWebTokenError`
    ) {
        code = 401;
        message = `invalid token`;
    } else if (error.name == `forbidden`) {
        code = 403;
        message = `Forbidden`;
    } else if (error.name == "already") {
        code = 400;
        message = "You already add this movie to your favorite";
    }
    res.status(code).json({ message });
};

module.exports = errorHandler;
