// components/LeagueMembers.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator, FlatList, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useGlobal } from "@/context/GlobalProvider";

type Row = {
  userId: string;
  username: string;
  profileImage?: string | null;
  points: number;
  rank: number;
  isSelf?: boolean;
};

const LeagueMembers: React.FC = () => {
  const { ngrokAPI, userData } = useGlobal();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token || !userData?._id) return;

        const { data } = await axios.post(`${ngrokAPI}/api/user/getLeagueMembers`, {
          token,
          UserID: userData._id,
          limit: 20,
          includeSelf: true
        });

        if (!alive) return;
        setRows(Array.isArray(data?.data) ? data.data : []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [ngrokAPI, userData?._id]);

  if (loading) {
    return (
      <View style={{ padding: 16, backgroundColor: "black" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: "black", paddingVertical: 8, paddingHorizontal: 16 }}>
      <Text style={styles.heading}>League members:</Text>
      <FlatList
        data={rows}
        keyExtractor={(item, i) => item.userId + "-" + i}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const name = item.isSelf ? "You" : item.username;
          const xp = (item.points || 0).toLocaleString();
          return (
            <View style={styles.row}>
              <Text style={styles.rank}>{item.rank}.</Text>

              <Image
                source={{ uri: item.profileImage || '' }}
                style={styles.avatar}
              />

              <Text style={styles.name} numberOfLines={1}>{name}</Text>

              <View style={styles.right}>
                <Text style={styles.xpValue}>{xp}</Text>
                <Text style={styles.xpUnit}> XP</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    color: "#FFFFFF",
    fontFamily: "poppins-semibold",
    fontSize: 20,
    marginBottom: 8
  },
  row: { flexDirection: "row", alignItems: "center" },
  rank: {
    width: 24,
    color: "#FFFFFF",
    opacity: 0.9,
    fontFamily: "poppins-semibold",
    fontSize: 16
  },
  avatar: {
    width: 36, height: 36, borderRadius: 999,
    marginHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.15)"
  },
  name: {
    flex: 1,
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
    fontSize: 14
  },
  right: { flexDirection: "row", alignItems: "baseline" },
  xpValue: {
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    letterSpacing: 0.25
  },
  xpUnit: {
    color: "#7E8AA6",
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    marginLeft: 4,
    textTransform: "uppercase"
  }
});

export default LeagueMembers;
