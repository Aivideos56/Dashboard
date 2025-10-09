import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tables: [],
  loading: false,
  error: null,
};

const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    setTables: (state, action) => {
      state.tables = action.payload;
      state.loading = false;
    },
    addTable: (state, action) => {
      state.tables.push(action.payload);
    },
    updateTable: (state, action) => {
      const index = state.tables.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tables[index] = action.payload;
      }
    },
    removeTable: (state, action) => {
      state.tables = state.tables.filter(t => t.id !== action.payload);
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
  setTables,
  addTable,
  updateTable,
  removeTable,
  setLoading,
  setError,
} = tableSlice.actions;

export default tableSlice.reducer;
