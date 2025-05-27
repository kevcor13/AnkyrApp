import {View, Text, TouchableOpacity, Image, Switch} from 'react-native'
import React, {useState} from 'react'
import {router} from "expo-router";
import icons from "@/constants/icons";

const Notifications = () => {
    const [notifications, setNotifications] = useState(false);
    const [dailyQuotes, setDailyQuotes] = useState(false);
    const [challenges, setChallenges] = useState(false);
    const [follows, setFollows] = useState(false);
    const [interactions, setInteractions] = useState(false);
    const [snaps, setSnaps] = useState(false)

    const toggleNotifications = () => {
        setNotifications(previousState => !previousState)
    }
    const toggleQuotes = () => {
        setDailyQuotes(previousState => !previousState)
    }
    const toggleChallenges = () => {
        setChallenges(previousState => !previousState)
    }
    const toggleFollows = () => {
        setFollows(previousState => !previousState)
    }
    const toggleInteractions = () => {
        setInteractions(previousState => !previousState)
    }
    const toggleSnaps = () => {
        setSnaps(previousState => !previousState)
    }

    return (
        <View className="bg-black h-full px-6">
            <View className="mt-16">
                <TouchableOpacity className="flex-row" onPress={() => router.back()}>
                    <Image source={icons.arrow} />
                    <Text className="text-white font-poppins-semibold text-[18px]">Settings</Text>
                </TouchableOpacity>
                <Text className="text-white mt-10 font-poppins-semibold text-[24px]">Notifications</Text>
                <View className="mt-16 flex-row">
                    <Text className="text-white font-poppins-medium text-[19px] flex-1">Change how often you get notifcations:</Text>
                </View>
                <View className="mt-14 flex-row items-center justify-between px-6">
                    <Text className="text-white font-poppins-medium text-[16px]">
                        Notifications
                    </Text>
                    <Switch
                        trackColor={{ false: '#767577', true: '#DCE0E3' }}
                        thumbColor={notifications ? '#333' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleNotifications}
                        value={notifications}
                    />
                </View>
                <View className="mt-14 flex-row items-center justify-between px-6">
                    <Text className="text-white font-poppins-medium text-[16px]">
                        Daily motivational quote
                    </Text>
                    <Switch
                        trackColor={{ false: '#767577', true: '#DCE0E3' }}
                        thumbColor={dailyQuotes ? '#333' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleQuotes}
                        value={dailyQuotes}
                    />
                </View>
                <View className="mt-14 flex-row items-center justify-between px-6">
                    <Text className="text-white font-poppins-medium text-[16px]">
                        Challenges/xp
                    </Text>
                    <Switch
                        trackColor={{ false: '#767577', true: '#DCE0E3' }}
                        thumbColor={challenges ? '#333' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleChallenges}
                        value={challenges}
                    />
                </View>
                <View className="mt-14 flex-row items-center justify-between px-6">
                    <Text className="text-white font-poppins-medium text-[16px]">
                        Profile follows
                    </Text>
                    <Switch
                        trackColor={{ false: '#767577', true: '#DCE0E3' }}
                        thumbColor={follows ? '#333' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleFollows}
                        value={follows}
                    />
                </View>
                <View className="mt-14 flex-row items-center justify-between px-6">
                    <Text className="text-white font-poppins-medium text-[16px]">
                        Post interactions
                    </Text>
                    <Switch
                        trackColor={{ false: '#767577', true: '#DCE0E3' }}
                        thumbColor={interactions ? '#333' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleInteractions}
                        value={interactions}
                    />
                </View>
                <View className="mt-14 flex-row items-center justify-between px-6">
                    <Text className="text-white font-poppins-medium text-[16px]">
                        When your snaps are ready
                    </Text>
                    <Switch
                        trackColor={{ false: '#767577', true: '#DCE0E3' }}
                        thumbColor={snaps ? '#333' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleSnaps}
                        value={snaps}
                    />
                </View>


            </View>
        </View>
    )
}
export default Notifications