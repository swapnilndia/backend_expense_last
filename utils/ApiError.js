class ApiError extends Error {
  constructor(status = 500, message = "Internal Server Error", data = {}) {
    super(message);
    this.status = status;
    this.data = data;
  }

  toJSON() {
    return {
      status: this.status,
      message: this.message,
      data: this.data,
      timestamp: new Date().toISOString(), // Add timestamp to all errors
    };
  }
}

export default ApiError;
