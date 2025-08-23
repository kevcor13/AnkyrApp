import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import images from '@/constants/images';
import LeagueMembers from './LeagueMembers';

type LeagueHeaderProps = { league: string | null };

const badgeMap: Record<string, any> = {
  OLYMPIAN: images.Olympian,
  TITAN:     images.titan,
  SKIPPER:   images.skipperBadge,
  PILOT:     images.pilot,
  PRIVATE:   images.Private,
  NOVICE:    images.bronze,
};

const LeagueHeader: React.FC<LeagueHeaderProps> = ({ league }) => {
  const [badgeImage, setBadgeImage] = useState(images.novice);

  useEffect(() => {
    const key = (league ?? 'NOVICE').toUpperCase();
    setBadgeImage(badgeMap[key] ?? images.novice);
  }, [league]);

  const lvl = (league ?? 'NOVICE').toUpperCase();
  const isOlympian = lvl === 'OLYMPIAN';
  const isTitan    = lvl === 'TITAN';
  const isVideo    = isOlympian || isTitan;

  // Nudge the title upward to sit closer to the badge
  const titleBump = isVideo ? -22 : -10; // adjust to taste

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        {isOlympian ? (
          <Video
            source={require('@/assets/Videos/OlympianMovBadge.mov')}
            style={styles.badge}
            resizeMode="contain"
            isLooping
            shouldPlay
            isMuted
          />
        ) : isTitan ? (
          <Video
            source={require('@/assets/Videos/TitanVid.mov')}
            style={styles.badge}
            resizeMode="contain"
            isLooping
            shouldPlay
            isMuted
          />
        ) : (
          <Image source={badgeImage} style={styles.badge} resizeMode="contain" />
        )}

        <Text
          style={[
            styles.leagueText,
            { transform: [{ translateY: titleBump }] }, // bring title closer
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {lvl}
        </Text>
      </View>

      <LeagueMembers />
    </View>
  );
};

export default LeagueHeader;

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#000', width: '100%', paddingBottom: 12 },
  header: { alignItems: 'center' },
  badge: { width: 320, height: 320 },
  leagueText: {
    fontFamily: 'Poppins-ExtraBold',
    fontSize: 26,
    color: '#FFF',
  },
});
