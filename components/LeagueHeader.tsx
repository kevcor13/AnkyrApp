import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import images from '@/constants/images';
import LeagueMembers from './LeagueMembers';

type LeagueHeaderProps = {
  league: string | null;
};

const badgeMap: Record<string, any> = {
  OLYMPIAN: images.Olympian,
  TITAN:     images.titan,
  SKIPPER:   images.skipper,
  PILOT:     images.pilot,
  PRIVATE:   images.Private,
  NOVICE:    images.novice,
};

const LeagueHeader: React.FC<LeagueHeaderProps> = ({ league }) => {
  const [badgeImage, setBadgeImage] = useState(images.novice);

  useEffect(() => {
    const key = (league ?? 'NOVICE').toUpperCase();
    setBadgeImage(badgeMap[key] ?? images.novice);
  }, [league]);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Image source={badgeImage} style={styles.badge} resizeMode="contain" />
        <Text style={styles.leagueText}>{(league ?? 'NOVICE').toUpperCase()}</Text>
      </View>
      <LeagueMembers />
    </View>
  );
};

export default LeagueHeader;

const styles = StyleSheet.create({
  // full-width block that can live inside a ScrollView
  wrap: {
    backgroundColor: '#000000',
    width: '100%',
    paddingBottom: 12,
  },
  // just the badge + label
  header: {
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 6,
  },
  badge: {
    width: 140,
    height: 140,
    marginBottom: 8,
  },
  leagueText: {
    fontFamily: 'Poppins-ExtraBold',
    fontSize: 26,
    color: '#FFFFFF',
  },
  // title above the list
  membersHeader: {
    width: '100%',
    paddingHorizontal: 20,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 10,
  },
});
