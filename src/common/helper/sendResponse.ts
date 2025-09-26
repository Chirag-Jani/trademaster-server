const successResponse = (message: string, data?: any) => {
  return {
    success: true,
    message,
    data,
  };
};

const errorResponse = (message: string, data?: any) => {
  return {
    success: false,
    message,
    data,
  };
};

export { errorResponse, successResponse };
