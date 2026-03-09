import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { activityAPI } from '../../services/api';

export const fetchActivities = createAsyncThunk('activity/fetchAll', async (params, { rejectWithValue }) => {
    try {
        const res = await activityAPI.getAll(params);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const addActivity = createAsyncThunk('activity/add', async (data, { rejectWithValue }) => {
    try {
        const res = await activityAPI.add(data);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const deleteActivity = createAsyncThunk('activity/delete', async (id, { rejectWithValue }) => {
    try {
        await activityAPI.delete(id);
        return id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

const activitySlice = createSlice({
    name: 'activity',
    initialState: { activities: [], loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchActivities.pending, (state) => { state.loading = true; })
            .addCase(fetchActivities.fulfilled, (state, action) => {
                state.loading = false;
                state.activities = action.payload.data || [];
            })
            .addCase(fetchActivities.rejected, (state, action) => {
                state.loading = false; state.error = action.payload;
            })
            .addCase(addActivity.fulfilled, (state, action) => {
                state.activities.unshift(action.payload.data);
            })
            .addCase(deleteActivity.fulfilled, (state, action) => {
                state.activities = state.activities.filter((a) => a._id !== action.payload);
            });
    },
});

export default activitySlice.reducer;
