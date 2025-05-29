import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import images from '@/constants/images';

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
    if (!league) return setBadgeImage(images.novice);
    const key = league.toUpperCase();
    setBadgeImage(badgeMap[key] ?? images.novice);
  }, [league]);

  return (
    <View style={styles.container}>
      <Image
        source={badgeImage}
        style={styles.badge}
        resizeMode="contain"
      />
      <Text style={styles.leagueText}>
        {league?.toUpperCase() ?? 'NOVICE'}
      </Text>
      <Text style={styles.membersHeader}>
        League members:
      </Text>
      {/* TODO: render your members list here */}
    </View>
  );
};

export default LeagueHeader;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    //paddingVertical: 24,
    backgroundColor: '#000000',
    height: '100%',
  },
  badge: {
    width: 140,
    height: 140,
    marginBottom: 12,
  },
  leagueText: {
    fontFamily: 'Poppins-ExtraBold',
    fontSize: 26,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  membersHeader: {
    width: '100%',
    paddingHorizontal: 20,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 12,
  },
});