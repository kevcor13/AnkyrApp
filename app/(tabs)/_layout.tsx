import { NativeTabs, Icon  } from "expo-router/unstable-native-tabs.js";
import React from 'react';
import {Tab} from '../../assets/icons/index';
import { Image, Text, View } from 'react-native';


const TabsLayout = () => {


    const TabIcon = ({focused, iconName, title} : {focused: boolean, iconName: string, title: string}) => (
        <View className="flex-1 mt-3 items-center">
            <Tab
                name={iconName}
                color={focused ? 'white' : 'gray'}
                size={60}
                //tintColor={focused ? 'white' : 'gray'}
                //tintColor={focused ? "#0061FF" : "#666876"}
                //className="size-9"
            />
            <Text
                className={`${
                    focused
                        ? "text-white font-poppins"
                        : "text-white font-poppins"
                } text-xs w-full text-center mt-1`}
            >
                {title}
            </Text>
        </View>
    )
    return (
        <NativeTabs
            tintColor="white"
        >
            <NativeTabs.Trigger name="nutrition" options={{title: ""}}>
                <Icon src={require('@/assets/icons/Meals.png')} />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="home" options={{title: ""}}>
                <Icon src={require('@/assets/icons/Home.png')} />
            </NativeTabs.Trigger>
            
            <NativeTabs.Trigger name="camera" options={{title: ""}}>
                <Icon src={require('@/assets/icons/Camera.png')} />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="profile" options={{title: ""}}>
                <Icon src={require('@/assets/icons/Profile.png')} />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="challanges" options={{title: ""}} role="search">
                <Icon src={require('@/assets/icons/Challenge.png')} />
            </NativeTabs.Trigger>

        </NativeTabs>

    // <Tabs.Screen
    //             name="nutrition"
    //             options={{
    //                 title: 'nutrition',
    //                 headerShown: false,
    //                 tabBarIcon: ({ focused }) => (
    //                     <TabIcon focused={focused} iconName="meals" title="" />
    //                 )
    //             }}
    //         />
    //         <Tabs.Screen
    //             name="challanges"
    //             options={{
    //                 title: 'challanges',
    //                 headerShown: false,
    //                 tabBarIcon: ({ focused }) => (
    //                     <TabIcon focused={focused} iconName="whiteStreak" title="" />
    //                 )
    //             }}
    //         />
    //         <Tabs.Screen
    //             name="home"
    //             options={{
    //                 title: 'home',
    //                 headerShown: false,
    //                 tabBarIcon: ({ focused }) => (
    //                     <TabIcon focused={focused} iconName="home" title="" />
    //                 )
    //             }}
    //         />
    //         <Tabs.Screen
    //             name="camera"
    //             options={{
    //                 title: "camera",
    //                 headerShown: false,
    //                 tabBarStyle: { display: "none" },
    //                 tabBarIcon: ({ focused }) => (
    //                     <TabIcon focused={focused} iconName="camera" title={''}/>
    //                 )
    //             }}
    //         />
    //         <Tabs.Screen
    //             name="profile"
    //             options={{
    //                 title: 'profile',
    //                 headerShown: false,
    //                 tabBarIcon: ({ focused }) => (
    //                     <TabIcon focused={focused} iconName="profile" title={''} />
    //                 )
    //             }}
    //         />
    //     </Tabs> 
    );
}
export default TabsLayout