import React from "react";
import { View, Text, Image, ScrollView, StyleSheet } from "react-native";

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
  const currentLeague = leagues.find((league) => league.name === League);

  return (
    <ScrollView contentContainerStyle={{ paddingVertical: 20 }} style={styles.container}>
      <View className="px-6">
        {/* ===== Current League (top) ===== */}
        {currentLeague && (
          <View className="mb-12 flex-row">
            <Image source={currentLeague.icon} className="w-40 h-40 mr-4" resizeMode="contain" />

            {/* Right column must have minWidth:0 so Text can shrink */}
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text className="text-xs uppercase text-white/80">Current league:</Text>

              <Text
                className="font-sintony-bold mt-4 pt-2"
                style={styles.currentLeagueName}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}     // allow more shrinking so it fits
                allowFontScaling
              >
                {currentLeague.name}
              </Text>

              <Text className="text-xs uppercase text-white/80 mt-6">Challenge XP:</Text>
              <Text className="font-raleway text-2xl text-[#8AFFF9] mt-1">
                {userXP.toLocaleString()} XP
              </Text>
            </View>
          </View>
        )}

        {/* ===== All Leagues ===== */}
        <View className="mt-2">
          {leagues.map((league, index) => {
            const isCurrentLeague = league.name === League;
            const isPassedLeague = league.xpRequired <= userXP && !isCurrentLeague;

            return (
              <View key={index} className="flex-row items-center py-6">
                <Image source={league.icon} className="w-16 h-16" resizeMode="contain" />

                {/* Middle: make text shrink too */}
                <View style={{ marginLeft: 16, flex: 1, minWidth: 0 }}>
                  <Text
                    style={styles.statusCaps}
                    className={
                      isCurrentLeague
                        ? "text-white/90"
                        : isPassedLeague
                        ? "text-gray-400/80"
                        : "text-gray-500/80"
                    }
                  >
                    {isCurrentLeague ? "CURRENT" : isPassedLeague ? "PASSED" : "LOCKED"}
                  </Text>

                  <Text
                    className={
                      (isCurrentLeague
                        ? "text-white"
                        : isPassedLeague
                        ? "text-gray-200"
                        : "text-gray-400") + " font-sintony-bold mt-1"
                    }
                    style={styles.leagueName}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.85}
                    allowFontScaling
                  >
                    {league.name}
                  </Text>
                </View>

                <View className="items-end">
                  <Text className="text-[10px] uppercase text-gray-500">Promotion:</Text>
                  <Text className="text-[10px] text-gray-500">
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingBottom: 40,
  },
  statusCaps: {
    textTransform: "uppercase",
    letterSpacing: 6,
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
  },
  // Big current-league name that can shrink cleanly
  currentLeagueName: {
    color: "#EAFBFF",
    fontSize: 44,          // ~ text-5xl; adjust if needed
    lineHeight: 48,        // keep a little breathing room
    flexShrink: 1,
    minWidth: 0,
    includeFontPadding: false as any, // Android: helps avoid visual cutoff
  },
  // Row league name that can shrink a bit if needed
  leagueName: {
    fontSize: 22,          // ~ text-2xl
    lineHeight: 26,
    flexShrink: 1,
    minWidth: 0,
    includeFontPadding: false as any,
  },
});

export default LeagueScreen;
