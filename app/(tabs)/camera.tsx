import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    Alert,
    Dimensions,
} from 'react-native';
import images from "@/constants/images";
import icons from "@/constants/icons";
import { uploadImage } from '@/lib/appwrite';
import { router } from "expo-router";
import { useGlobal } from "@/context/GlobalProvider";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width: SCREEN_W } = Dimensions.get('window');
const sx = (x: number) => (x / 375) * SCREEN_W;
const sy = (y: number) => (y / 812) * Dimensions.get('window').height;

export default function App() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<any>(null);
    const { userData, ngrokAPI } = useGlobal();

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    if (!permission) return <View />;

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
                    <Text style={styles.permissionButtonText}>Grant permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const takePicture = async () => {
        if (!userData?._id || !cameraRef.current) return;

        try {
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });

            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'No authentication token found');
                return;
            }

            const uploadResult = await uploadImage(photo.uri, userData._id);
            if (!uploadResult.success) {
                Alert.alert('Upload Failed', 'Could not upload image to storage');
                return;
            }

            const response = await axios.post(`${ngrokAPI}/upload`, {
                imageUrl: uploadResult.fileUrl,
                UserID: userData._id,
            });

            if (response.data.status === 'success') {
                router.push('/(components)/UserPost');
            } else {
                Alert.alert('Upload Failed', JSON.stringify(response.data));
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                Alert.alert('Network Error', error.response?.data?.message ?? error.message);
            } else {
                Alert.alert('Error', String(error));
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.cameraWrapper}>
                <CameraView style={StyleSheet.absoluteFill} facing={facing} ref={cameraRef} />
                <View style={styles.watermark}>
                    <Image source={images.ankyrIcon} style={styles.watermarkIcon} />
                </View>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={() => router.push('/home')}>
                <Image source={icons.x} style={styles.closeIcon} />
            </TouchableOpacity>

            <Text style={styles.dateText}>{dateStr}</Text>

            <TouchableOpacity style={styles.captureButton} onPress={takePicture} />

            <TouchableOpacity style={styles.flipButton} onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}>
                <Image source={images.flipCamera} style={styles.sideIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.galleryButton} onPress={() => router.push('/(components)/UserPost')}>
                <Image source={images.pictureIcons} style={styles.sideIcon} />
            </TouchableOpacity>

            <View style={styles.homeIndicatorBar}>
                <View style={styles.homeIndicatorPill} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    message: { textAlign: 'center', color: 'white', marginBottom: 20 },
    permissionButton: {
        alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 10,
        backgroundColor: 'white', borderRadius: 8,
    },
    permissionButtonText: { color: 'black', fontWeight: '600' },
    cameraWrapper: {
        position: 'absolute',
        top: sy(58), left: 0, right: 0,
        height: sy(640), borderRadius: 35, overflow: 'hidden',
    },
    watermark: {
        position: 'absolute', bottom: 16, right: 16,
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.35)',
        borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4,
    },
    watermarkIcon: { width: 20, height: 20, tintColor: 'white' },
    closeButton: {
        position: 'absolute', top: sy(73), left: sx(12),
        width: sx(33), height: sx(33),
        justifyContent: 'center', alignItems: 'center',
    },
    closeIcon: { width: '100%', height: '100%', tintColor: 'white' },
    dateText: {
        position: 'absolute', top: sy(736), left: sx(140),
        fontSize: 13, letterSpacing: 0.2, lineHeight: 18,
        color: '#696969', width: sx(99),
    },
    captureButton: {
        position: 'absolute',
        bottom: sy(130), left: (SCREEN_W - sx(81)) / 2,
        width: sx(81), height: sx(81),
        borderRadius: 100, backgroundColor: 'white',
    },
    flipButton: {
        position: 'absolute', bottom: sy(143), left: sx(26),
        width: sx(27), height: sx(27),
        justifyContent: 'center', alignItems: 'center',
    },
    galleryButton: {
        position: 'absolute', bottom: sy(143), left: sx(320),
        width: sx(27), height: sx(27),
        justifyContent: 'center', alignItems: 'center',
    },
    sideIcon: { width: '100%', height: '100%' },
    homeIndicatorBar: {
        position: 'absolute', bottom: 15, left: 0, right: 0,
        height: 100, backgroundColor: 'black',
        alignItems: 'center', justifyContent: 'center',
    },
    homeIndicatorPill: { width: 134, height: 5, borderRadius: 100, backgroundColor: 'white' },
});
