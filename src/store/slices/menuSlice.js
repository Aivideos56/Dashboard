import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	categories: [],
	subCategories: [],
	products: [],
	loading: false,
	error: null,
};

const menuSlice = createSlice({
	name: 'menu',
	initialState,
	reducers: {
		setCategories: (state, action) => {
			state.categories = action.payload;
			state.loading = false;
		},
		addCategory: (state, action) => {
			state.categories.push(action.payload);
		},
		updateCategory: (state, action) => {
			const index = state.categories.findIndex((c) => c.id === action.payload.id);
			if (index !== -1) {
				state.categories[index] = action.payload;
			}
		},
		removeCategory: (state, action) => {
			state.categories = state.categories.filter((c) => c.id !== action.payload);
		},
		setSubCategories: (state, action) => {
			state.subCategories = action.payload;
		},
		addSubCategory: (state, action) => {
			state.subCategories.push(action.payload);
		},
		updateSubCategory: (state, action) => {
			const index = state.subCategories.findIndex((sc) => sc.id === action.payload.id);
			if (index !== -1) {
				state.subCategories[index] = action.payload;
			}
		},
		removeSubCategory: (state, action) => {
			state.subCategories = state.subCategories.filter((sc) => sc.id !== action.payload);
		},
		setProducts: (state, action) => {
			state.products = action.payload;
			state.loading = false;
		},
		addProduct: (state, action) => {
			state.products.push(action.payload);
		},
		updateProduct: (state, action) => {
			const index = state.products.findIndex((p) => p.id === action.payload.id);
			if (index !== -1) {
				state.products[index] = action.payload;
			}
		},
		removeProduct: (state, action) => {
			state.products = state.products.filter((p) => p.id !== action.payload);
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
	setCategories,
	addCategory,
	updateCategory,
	removeCategory,
	setSubCategories,
	addSubCategory,
	updateSubCategory,
	removeSubCategory,
	setProducts,
	addProduct,
	updateProduct,
	removeProduct,
	setLoading,
	setError,
} = menuSlice.actions;

export default menuSlice.reducer;
