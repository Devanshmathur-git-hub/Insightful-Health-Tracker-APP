import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { medicationAPI } from '../../services/api';

export const fetchMedications = createAsyncThunk('medication/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const res = await medicationAPI.getAll();
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const addMedication = createAsyncThunk('medication/add', async (data, { rejectWithValue }) => {
    try {
        const res = await medicationAPI.add(data);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const markMedicationTaken = createAsyncThunk('medication/markTaken', async (id, { rejectWithValue }) => {
    try {
        const res = await medicationAPI.markTaken(id);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const deleteMedication = createAsyncThunk('medication/delete', async (id, { rejectWithValue }) => {
    try {
        await medicationAPI.delete(id);
        return id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

const medicationSlice = createSlice({
    name: 'medication',
    initialState: { medications: [], loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMedications.pending, (state) => { state.loading = true; })
            .addCase(fetchMedications.fulfilled, (state, action) => {
                state.loading = false;
                state.medications = action.payload.data || [];
            })
            .addCase(fetchMedications.rejected, (state, action) => {
                state.loading = false; state.error = action.payload;
            })
            .addCase(addMedication.fulfilled, (state, action) => {
                state.medications.unshift(action.payload.data);
            })
            .addCase(markMedicationTaken.fulfilled, (state, action) => {
                const idx = state.medications.findIndex((m) => m._id === action.payload.data._id);
                if (idx !== -1) state.medications[idx] = action.payload.data;
            })
            .addCase(deleteMedication.fulfilled, (state, action) => {
                state.medications = state.medications.filter((m) => m._id !== action.payload);
            });
    },
});

export default medicationSlice.reducer;
