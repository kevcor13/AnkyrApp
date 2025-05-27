import React, { useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Video } from 'expo-av';
import { useRouter } from 'expo-router';

export default function VideoFile() {
    const router = useRouter();
    const videoSource = require('../../assets/Videos/videoankyr.mp4');

    return (
        <View style={{ flex: 1 }}>
            <Video
                source={videoSource}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
                shouldPlay
                onPlaybackStatusUpdate={(status) => {
                    if (status.didJustFinish) {
                        // "Refresh" by replacing the current route
                        router.replace('/home')


                    }
                }
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: 'white',
        fontSize: 24,
    },
});