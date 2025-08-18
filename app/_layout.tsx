// app/_layout.tsx
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import GlobalProvider from '../context/GlobalProvider.js';
import ScaleProvider  from "@/providers/ScaleProvider";
import "../global.css";

// Set the notification handler to show alerts even when the app is foregrounded

const RootLayout = () => {
    const [fontsLoaded, error] = useFonts({
        Poppins: require('../assets/fonts/Poppins-Regular.ttf'),
        "Poppins-Bold": require('../assets/fonts/Poppins-Bold.ttf'),
        "Poppins-SemiBold": require('../assets/fonts/Poppins-SemiBold.ttf'),
        "Poppins-Medium": require('../assets/fonts/Poppins-Medium.ttf'),
        "Poppins-Light": require('../assets/fonts/Poppins-Light.ttf'),
        "Poppins-BoldItalic": require('../assets/fonts/Poppins-BoldItalic.ttf'),
        Quicksand: require('../assets/fonts/Quicksand-static/Quicksand-Regular.ttf'),
        Raleway: require('../assets/fonts/Raleway-Regular.ttf'),
        "Raleway-Semibold": require('../assets/fonts/Raleway-static/Raleway-SemiBold.ttf'),
        "Raleway-Light": require('../assets/fonts/Raleway-static/Raleway-Light.ttf'),
        Sintony: require('../assets/fonts/Sintony-Regular.ttf'),
        "Sintony-Bold": require('../assets/fonts/Sintony-Bold.ttf'),
    });

    useEffect(() => {
        if (fontsLoaded || error) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, error]);

    if (!fontsLoaded && !error) {
        console.log(error);
        return null;
    }

    return (
        <GlobalProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(root)/sign-in" options={{gestureEnabled: false}}/>
                <Stack.Screen name="(root)/sign-up" options={{gestureEnabled: false}}/>
                
                <Stack.Screen name="(workout)/ActiveWorkoutScreen" options={{gestureEnabled: false}}/>
            </Stack>
        </GlobalProvider>
    );
};

export default RootLayout;