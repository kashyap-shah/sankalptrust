import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    userData: {},
    isLoggedIn: false,
}

export const userSessionReducer = createSlice({
    name: 'USERSESSION',
    initialState,
    reducers: {
        setUserData: (state, action) => {
            if( action.payload ) {
                state.isLoggedIn = true
                state.userData = action.payload
            }
        },
    }
})

// Action creators are generated for each case reducer function
export const { setUserData } = userSessionReducer.actions

export default userSessionReducer.reducer