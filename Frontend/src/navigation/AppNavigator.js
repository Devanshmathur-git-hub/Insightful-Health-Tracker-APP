import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import LogScreen from '../screens/main/LogScreen';
import ActivityTrackerScreen from '../screens/main/ActivityTrackerScreen';
import ReportsScreen from '../screens/main/ReportsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

import { Colors } from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab icon component
const TabIcon = ({ icon, label, focused }) => (
    <View style={styles.tabItem}>
        <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icon}</Text>
        <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
    </View>
);

// Main bottom tab navigator
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: false,
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Home" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Log"
                component={LogScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon icon="📝" label="Log" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Activity"
                component={ActivityTrackerScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon icon="🗺️" label="Track" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Reports"
                component={ReportsScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon icon="📊" label="Reports" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon icon="👤" label="Profile" focused={focused} />,
                }}
            />
        </Tab.Navigator>
    );
}

// Root navigator with auth guard
export default function AppNavigator() {
    const { isAuthenticated } = useSelector((state) => state.auth);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <Stack.Screen name="Main" component={MainTabs} />
                ) : (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: Colors.surface,
        borderTopColor: Colors.cardBorder,
        borderTopWidth: 1,
        height: 70,
        paddingBottom: 8,
        paddingTop: 8,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    tabIcon: {
        fontSize: 22,
        opacity: 0.5,
    },
    tabIconFocused: {
        opacity: 1,
    },
    tabLabel: {
        fontSize: 10,
        color: Colors.textMuted,
        fontWeight: '500',
    },
    tabLabelFocused: {
        color: Colors.primary,
        fontWeight: '700',
    },
});
