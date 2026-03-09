import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../services/api';

// ── THUNKS ────────────────────────────────────────────
export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
    try {
        console.log('Registering user with:', data);
        const res = await authAPI.register(data);
        console.log('Registration response:', res.data);
        await AsyncStorage.setItem('authToken', res.data.token);
        return res.data;
    } catch (err) {
        console.error('Registration error:', err);
        const errorMsg = err.response?.data?.message || err.message || 'Registration failed';
        console.error('Error message:', errorMsg);
        return rejectWithValue(errorMsg);
    }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
    try {
        const res = await authAPI.login(data);
        await AsyncStorage.setItem('authToken', res.data.token);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
    await authAPI.logout().catch(() => { });
    await AsyncStorage.removeItem('authToken');
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
    try {
        const res = await authAPI.getMe();
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
    }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
    try {
        const res = await authAPI.updateProfile(data);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Update failed');
    }
});

// ── SLICE ─────────────────────────────────────────────
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: null,
        loading: false,
        error: null,
        isAuthenticated: false,
    },
    reducers: {
        clearError: (state) => { state.error = null; },
        setToken: (state, action) => {
            state.token = action.payload;
            state.isAuthenticated = !!action.payload;
        },
    },
    extraReducers: (builder) => {
        const pending = (state) => { state.loading = true; state.error = null; };
        const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

        builder
            .addCase(registerUser.pending, pending)
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(registerUser.rejected, rejected)

            .addCase(loginUser.pending, pending)
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, rejected)

            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            })

            .addCase(getMe.pending, pending)
            .addCase(getMe.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
            })
            .addCase(getMe.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
            })

            .addCase(updateProfile.fulfilled, (state, action) => {
                state.user = action.payload.user;
            });
    },
});

export const { clearError, setToken } = authSlice.actions;
export default authSlice.reducer;
