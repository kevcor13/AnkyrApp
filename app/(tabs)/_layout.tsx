import { NativeTabs, Icon } from "expo-router/unstable-native-tabs.js";
import React from 'react';

import icons from "@/constants/icons";
const TabsLayout = () => {
    return (
        <NativeTabs
            tintColor="white"
        >
            <NativeTabs.Trigger name="nutrition" options={{title: ""}}>
                <Icon src={icons.tabMeals} />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="home" options={{title: ""}}>
                <Icon src={icons.tabHome} />
            </NativeTabs.Trigger>
            
            <NativeTabs.Trigger name="camera" options={{title: ""}}>
                <Icon src={icons.tabCamera} />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="profile" options={{title: ""}}>
                <Icon src={icons.tabProfile} />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="challanges" options={{title: ""}} role="search">
                <Icon src={icons.tabChallenge} />
            </NativeTabs.Trigger>

        </NativeTabs>
    );
}
export default TabsLayout
