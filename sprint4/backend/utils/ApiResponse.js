class ApiResponse {
    constructor(data, error = null) {
      this.timestamp = new Date().toISOString();
      this.data = data;
      this.error = error;
    }
  }
  
  module.exports = ApiResponse;
  