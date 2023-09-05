const initialState = {
    error_status: false
}

export default (state = initialState, action) => {
    switch (action.type) {
      case "error-occured":
        return {
          error_status: true
        };
        case "no-error":
        return {
          error_status: false
        };
      default:
        return state;
    }
  };