import { createSlice } from '@reduxjs/toolkit'

export const errorSlice = createSlice({
  name: 'error',
  initialState: {
    value: false,
  },
  reducers: {
    error_occured: (state) => {
      state.value = true;
    },
    no_error: (state) => {
      state.value = false;
    },
  },
})

export const { error_occured, no_error } = errorSlice.actions

export default errorSlice.reducer