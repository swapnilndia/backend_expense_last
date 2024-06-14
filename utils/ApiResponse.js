class ApiResponse {
  constructor(status = 200, message = "Success", data = {}, metaData = {}) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.metaData = metaData;
  }

  toJSON() {
    return {
      status: this.status,
      message: this.message,
      data: this.data,
      metaData: this.metaData,
    };
  }
}

export default ApiResponse;
