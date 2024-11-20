class ResponseUtil {
    constructor({ success, message, data = null, statusCode = 200, errors = null }, res) {
      this.success = success;
      this.message = message;
      this.data = data;
      this.statusCode = statusCode;
      this.errors = errors;
     
      if (res) {
        res.status(this.statusCode).json({
          success: this.success,
          message: this.message,
          data: this.data,
          statusCode: this.statusCode,
          errors: this.errors,
        });
      }
    }
  }

module.exports = ResponseUtil;