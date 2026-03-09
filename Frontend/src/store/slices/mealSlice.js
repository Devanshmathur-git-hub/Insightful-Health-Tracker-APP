import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mealAPI } from '../../services/api';

export const fetchMeals = createAsyncThunk('meal/fetchAll', async (params, { rejectWithValue }) => {
    try {
        const res = await mealAPI.getAll(params);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const addMeal = createAsyncThunk('meal/add', async (data, { rejectWithValue }) => {
    try {
        const res = await mealAPI.add(data);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const deleteMeal = createAsyncThunk('meal/delete', async (id, { rejectWithValue }) => {
    try {
        await mealAPI.delete(id);
        return id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

const mealSlice = createSlice({
    name: 'meal',
    initialState: { meals: [], loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMeals.pending, (state) => { state.loading = true; })
            .addCase(fetchMeals.fulfilled, (state, action) => {
                state.loading = false;
                state.meals = action.payload.data || [];
            })
            .addCase(fetchMeals.rejected, (state, action) => {
                state.loading = false; state.error = action.payload;
            })
            .addCase(addMeal.fulfilled, (state, action) => {
                state.meals.unshift(action.payload.data);
            })
            .addCase(deleteMeal.fulfilled, (state, action) => {
                state.meals = state.meals.filter((m) => m._id !== action.payload);
            });
    },
});

export default mealSlice.reducer;
