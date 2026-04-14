import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import GlobalProvider from '../context/GlobalProvider.js';
import ScaleProvider from "@/providers/ScaleProvider";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../global.css";

const RootLayout = () => {
    const [fontsLoaded, error] = useFonts({
        Poppins: require('../assets/fonts/Poppins-Regular.ttf'),
        "Poppins-Bold": require('../assets/fonts/Poppins-Bold.ttf'),
        "Poppins-SemiBold": require('../assets/fonts/Poppins-SemiBold.ttf'),
        "Poppins-Medium": require('../assets/fonts/Poppins-Medium.ttf'),
        "Poppins-Light": require('../assets/fonts/Poppins-Light.ttf'),
        "Poppins-BoldItalic": require('../assets/fonts/Poppins-BoldItalic.ttf'),
        Quicksand: require('../assets/fonts/Quicksand-static/Quicksand-Regular.ttf'),
        SpaceGrotesk: require('../assets/fonts/SpaceGrotesk/SpaceGrotesk-Regular.ttf'),
        "SpaceGrotesk-Bold": require('../assets/fonts/SpaceGrotesk/SpaceGrotesk-Bold.ttf'),
        "SpaceGrotesk-SemiBold": require('../assets/fonts/SpaceGrotesk/SpaceGrotesk-SemiBold.ttf'),
        "SpaceGrotesk-Medium": require('../assets/fonts/SpaceGrotesk/SpaceGrotesk-Medium.ttf'),
        "SpaceGrotesk-Light": require('../assets/fonts/SpaceGrotesk/SpaceGrotesk-Light.ttf'),
        Raleway: require('../assets/fonts/Raleway-Regular.ttf'),
        "Raleway-Semibold": require('../assets/fonts/Raleway-static/Raleway-SemiBold.ttf'),
        "Raleway-Light": require('../assets/fonts/Raleway-static/Raleway-Light.ttf'),
        Sintony: require('../assets/fonts/Sintony-Regular.ttf'),
        "Sintony-Bold": require('../assets/fonts/Sintony-Bold.ttf'),
        Saira: require('../assets/fonts/Saira_Extra_Condensed/SairaExtraCondensed-Regular.ttf'),
        "Saira-Bold": require('../assets/fonts/Saira_Extra_Condensed/SairaExtraCondensed-Bold.ttf'),
    });

    useEffect(() => {
        if (fontsLoaded || error) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, error]);

    if (!fontsLoaded && !error) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <GlobalProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(root)/sign-in" options={{ gestureEnabled: false }} />
                    <Stack.Screen name="(root)/sign-up" options={{ gestureEnabled: false }} />
                    <Stack.Screen name="(workout)/ActiveWorkoutScreen" options={{ gestureEnabled: false }} />
                </Stack>
            </GlobalProvider>
        </GestureHandlerRootView>
    );
};

export default RootLayout;