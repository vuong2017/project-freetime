export const handleError = function (res, error, statusCode) {
  if (error.name == "ValidationError") {
    const errors = {};
    for (const key in error.errors) {
      errors[key] = (error.errors[key] || {}).message;
    }
    return res.status(442).json({
      status: false,
      errors
    });
  } else if (statusCode) {
    return res.status(statusCode).json({
      status: false,
      error
    });
  }
  else {
    res.status(500).json({
      status: false,
      errors: { message: "An unknown error" }
    });
  }
};
