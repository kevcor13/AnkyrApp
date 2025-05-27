import React from "react";
import { View, Text, Image, ScrollView } from "react-native";

interface LeagueBadge {
    name: string;
    xpRequired: number;
    icon: any;
}

const leagues: LeagueBadge[] = [
    { name: "OLYMPIAN", xpRequired: 30000, icon: require("@/assets/Leagues/Olympian.png") },
    { name: "TITAN", xpRequired: 20000, icon: require("@/assets/Leagues/Titan.png") },
    { name: "SKIPPER", xpRequired: 12000, icon: require("@/assets/Leagues/Skipper.png") },
    { name: "PILOT", xpRequired: 5000, icon: require("@/assets/Leagues/Pilot.png") },
    { name: "PRIVATE", xpRequired: 1000, icon: require("@/assets/Leagues/Private.png") },
    { name: "NOVICE", xpRequired: 500, icon: require("@/assets/Leagues/Novice.png") },
];

interface LeagueScreenProps {
    userXP: number;
    League: string;
}

const LeagueScreen: React.FC<LeagueScreenProps> = ({ userXP, League }) => {
    // Find the current league
    const currentLeague = leagues.find((league) => league.name === League);

    return (
        <ScrollView contentContainerStyle={{ paddingVertical: 20 }} className="bg-black flex-1">
            <View className="px-6">
                {/* Current League Section */}
                {currentLeague && (
                    <View className="mb-10 flex-row">
                        <View>
                            <Image
                                source={currentLeague.icon}
                                className="w-40 h-40"
                                resizeMode="contain"
                            />
                        </View>
                        <View>
                            <Text className="text-lg font-poppins text-white px-6">Current League: </Text>
                            <Text className="font-sintony-bold text-4xl text-[#F3F3F3]  px-6 mt-6">{currentLeague.name}</Text>
                            <Text className="text-lg mt-6 text-white px-6">CHALLENGE XP: </Text>
                            <Text  className="font-raleway text-lg text-[#8AFFF9] px-6">{userXP} xp</Text>
                        </View>

                    </View>
                )}

                {/* All Leagues Section */}
                <View className="px-6">
                    {leagues.map((league, index) => {
                        const isCurrentLeague = league.name === League;
                        const isPassedLeague = league.xpRequired <= userXP && !isCurrentLeague;

                        return (
                            <View key={index} className="flex-row items-center mt-16 justify-between">
                                {/* Left side: Badge */}
                                <View
                                    className={`rounded-full items-center justify-center ${
                                        isCurrentLeague
                                            ? "w-12 h-12"
                                            : isPassedLeague
                                                ? "w-12 h-12 bg-gray-700"
                                                : "w-12 h-12 bg-gray-900"
                                    }`}
                                >
                                    <Image
                                        source={league.icon}
                                        className={`w-20 h-20`}
                                        resizeMode="contain"
                                    />
                                </View>

                                {/* Center: Badge Details */}
                                <View className="ml-10 flex-1">
                                    <Text
                                        className={`uppercase text-sm font-quicksand ${
                                            isCurrentLeague
                                                ? "text-white font-bold"
                                                : isPassedLeague
                                                    ? "text-gray-400"
                                                    : "text-gray-500"
                                        }`}
                                    >
                                        {isCurrentLeague ? "CURRENT" : isPassedLeague ? "PASSED" : "LOCKED"}
                                    </Text>
                                    <Text
                                        className={`text-2xl font-sintony-bold ${
                                            isCurrentLeague
                                                ? "text-white font-bold"
                                                : isPassedLeague
                                                    ? "text-gray-200"
                                                    : "text-gray-400"
                                        }`}
                                    >
                                        {league.name}
                                    </Text>
                                </View>

                                {/* Right side: Promotion Details aligned left */}
                                <View className="">
                                    <Text className="text-xs text-gray-500">PROMOTION:</Text>
                                    <Text className="text-xs text-gray-500">
                                        {league.xpRequired.toLocaleString()} XP
                                    </Text>
                                </View>
                            </View>

                        );
                    })}
                </View>
            </View>
        </ScrollView>
    );
};

export default LeagueScreen;