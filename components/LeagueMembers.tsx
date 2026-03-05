// components/LeagueMembers.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator, FlatList, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useGlobal } from "@/context/GlobalProvider";

type Row = {
  userId: string;
  username: string;
  profileImage: string;
  points: number;
  rank: number;
  isSelf?: boolean;
};

type DisplayRow = Row | { kind: "divider"; id: string };

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
          includeSelf: true,
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
      <View style={{ padding: 16, alignItems: "center" }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  const normalizedRows: Row[] = rows.map(item => ({
    ...item,
    isSelf: item.userId === String(userData?._id) || item.isSelf,
  }));

  const topFive = normalizedRows.slice(0, 5);
  const selfRow = normalizedRows.find(r => r.isSelf);
  const isSelfInTopFive = !!selfRow && topFive.some(r => r.userId === selfRow.userId);

  const displayRows: DisplayRow[] = isSelfInTopFive || !selfRow
    ? topFive
    : [...topFive, { kind: "divider", id: "self-divider" }, selfRow];

  return (
    <View style={styles.container}>
      <FlatList
        data={displayRows}
        keyExtractor={(item, i) => ("kind" in item ? item.id : item.userId + "-" + i)}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        renderItem={({ item }) => {
          if ("kind" in item) {
            return (
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
              </View>
            );
          }

          const displayName = item.isSelf ? "You" : item.username;
          const xp = (item.points || 0).toLocaleString();

          return (
            <View style={styles.row}>
              <Text style={styles.rank}>{item.rank}.</Text>

              <View style={styles.avatarWrapper}>
                <Image
                  source={
                      { uri: item.profileImage }
            
                  }
                  style={styles.avatar}
                />
              </View>

              <Text style={styles.name} numberOfLines={1}>
                {displayName}
              </Text>

              <View style={styles.xpContainer}>
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
  container: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rank: {
    width: 28,
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    opacity: 0.95,
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  name: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
  },
  xpContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  xpValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    letterSpacing: 0.3,
  },
  xpUnit: {
    color: "#8A96B0",
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    textTransform: "uppercase",
    marginLeft: 2,
  },
  dividerRow: {
    height: 20,
    justifyContent: "center",
  },
  dividerLine: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});

export default LeagueMembers;