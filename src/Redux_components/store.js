import { configureStore } from '@reduxjs/toolkit'
import errorReducer from './Actions/error.js';

export default configureStore({
  reducer: {
    error: errorReducer
  },
})