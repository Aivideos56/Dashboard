import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	user: null,
	restaurant: null,
	isAdmin: false,
	isAuthenticated: false,
};

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		loginAdmin: (state, action) => {
			state.user = action.payload;
			state.isAdmin = true;
			state.isAuthenticated = true;
			state.restaurant = null;
		},
		loginRestaurant: (state, action) => {
			state.user = action.payload;
			state.restaurant = action.payload;
			state.isAdmin = false;
			state.isAuthenticated = true;
		},
		logout: (state) => {
			state.user = null;
			state.restaurant = null;
			state.isAdmin = false;
			state.isAuthenticated = false;
		},
		updateUser: (state, action) => {
			state.user = { ...state.user, ...action.payload };
			if (!state.isAdmin) {
				state.restaurant = { ...state.restaurant, ...action.payload };
			}
		},
	},
});

export const { loginAdmin, loginRestaurant, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
