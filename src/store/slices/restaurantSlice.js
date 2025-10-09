import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  restaurants: [],
  currentRestaurant: null,
  loading: false,
  error: null,
};

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {
    setRestaurants: (state, action) => {
      state.restaurants = action.payload;
      state.loading = false;
    },
    setCurrentRestaurant: (state, action) => {
      state.currentRestaurant = action.payload;
    },
    addRestaurant: (state, action) => {
      state.restaurants.push(action.payload);
    },
    updateRestaurant: (state, action) => {
      const index = state.restaurants.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.restaurants[index] = action.payload;
      }
      if (state.currentRestaurant?.id === action.payload.id) {
        state.currentRestaurant = action.payload;
      }
    },
    removeRestaurant: (state, action) => {
      state.restaurants = state.restaurants.filter(r => r.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setRestaurants,
  setCurrentRestaurant,
  addRestaurant,
  updateRestaurant,
  removeRestaurant,
  setLoading,
  setError,
} = restaurantSlice.actions;

export default restaurantSlice.reducer;
