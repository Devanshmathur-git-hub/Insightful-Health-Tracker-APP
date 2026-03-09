import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { healthAPI } from '../../services/api';

export const fetchHealthRecords = createAsyncThunk('health/fetchAll', async (params, { rejectWithValue }) => {
    try {
        const res = await healthAPI.getAll(params);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch records');
    }
});

export const addHealthRecord = createAsyncThunk('health/add', async (data, { rejectWithValue }) => {
    try {
        const res = await healthAPI.addRecord(data);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to add record');
    }
});

export const deleteHealthRecord = createAsyncThunk('health/delete', async (id, { rejectWithValue }) => {
    try {
        await healthAPI.delete(id);
        return id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to delete');
    }
});

const healthSlice = createSlice({
    name: 'health',
    initialState: {
        records: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearHealthError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchHealthRecords.pending, (state) => { state.loading = true; })
            .addCase(fetchHealthRecords.fulfilled, (state, action) => {
                state.loading = false;
                state.records = action.payload.data || [];
            })
            .addCase(fetchHealthRecords.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addHealthRecord.fulfilled, (state, action) => {
                state.records.unshift(action.payload.data);
            })
            .addCase(deleteHealthRecord.fulfilled, (state, action) => {
                state.records = state.records.filter((r) => r._id !== action.payload);
            });
    },
});

export const { clearHealthError } = healthSlice.actions;
export default healthSlice.reducer;
