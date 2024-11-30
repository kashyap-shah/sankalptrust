import { configureStore } from '@reduxjs/toolkit'
import userSessionReducer from 'util/reducer/user_reducer'

export const store = configureStore({
  reducer: {
	  USERSESSION: userSessionReducer,
  },
})