import icons from '@/constants/icons';
import images from '@/constants/images';
import { Tabs } from "expo-router";
import React from 'react';
import { Image, Text, View } from 'react-native';
const TabsLayout = () => {


    const TabIcon = ({focused, icon, title} : {focused: boolean, icon: any, title: string}) => (
        <View className="flex-1 mt-3 items-center">
            <Image
                source={icon}
                tintColor={focused ? 'white' : 'gray'}
                //tintColor={focused ? "#0061FF" : "#666876"}
                className="size-9"
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
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: 'black',
                    position: 'absolute',
                    borderTopColor: 'black',
                    borderTopWidth: 1,
                    minHeight: 70,
                },
            }}
        >
            <Tabs.Screen
                name="nutrition"
                options={{
                    title: 'nutrition',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={images.meals} title="" />
                    )
                }}
            />
            <Tabs.Screen
                name="challanges"
                options={{
                    title: 'challanges',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={icons.whiteZap} title="" />
                    )
                }}
            />
            <Tabs.Screen
                name="home"
                options={{
                    title: 'home',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={images.ankyrIcon} title="" />
                    )
                }}
            />
            <Tabs.Screen
                name="camera"
                options={{
                    title: "camera",
                    headerShown: false,
                    tabBarStyle: { display: "none" },
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={images.WheelIcon} title={''}/>
                    )
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'profile',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={images.profile} title={''} />
                    )
                }}
            />
        </Tabs>
    )
}
export default TabsLayout