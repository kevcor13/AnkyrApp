import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    SafeAreaView,
    Image,
    Alert
} from 'react-native';
import images from "@/constants/images";
import icons from "@/constants/icons";
import { uploadImage } from '@/lib/appwrite';
import { router } from "expo-router";
import { useGlobal } from "@/context/GlobalProvider";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function App() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<any>(null);
    const { userData, ngrokAPI } = useGlobal();

    if (!permission) {
        return <View />;
    }

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

    function toggleCameraFacing() {
        setFacing((current) => (current === 'back' ? 'front' : 'back'));
    }

    const takePicture = async () => {
        if (!userData?._id) {
            console.error('No user ID available');
            return;
        }

        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.7,
                    base64: true
                });

                console.log('Photo captured:', photo.uri);
                const UserID = userData?._id;

                const token = await AsyncStorage.getItem("token");
                if (!token) {
                    console.error("No authentication token found");
                    return;
                }

                const uploadResult = await uploadImage(photo.uri, userData._id);

                if (!uploadResult.success) {
                    Alert.alert('Upload Failed', 'Could not upload image to storage');
                    return;
                }
                console.log('Image uploaded to storage:', uploadResult.fileUrl);
                const imageUrl = uploadResult.fileUrl;
                const response = await axios.post(`${ngrokAPI}/upload`, { imageUrl, UserID });

                if (response.data.status === 'success') {
                    console.log("Upload successful. Image URL:", response.data.data.url);
                    router.push('/(components)/UserPost');
                } else {
                    console.error("Upload failed:", response.data);
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.error('Error uploading image:', error.response?.data || error.message);
                } else {
                    console.error('Error capturing photo:', error);
                }
            }
        }
    };

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing={facing} ref={cameraRef}>

                {/* Top Bar */}
                <SafeAreaView style={styles.topBar}>
                    <Text style={styles.topTitle}>Capture.</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={() => router.push('/home')}>
                        <Image source={icons.x} style={styles.closeIcon} />
                    </TouchableOpacity>
                </SafeAreaView>

                {/* Bottom Bar */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.sideButton} onPress={toggleCameraFacing}>
                        <Image source={images.flipCamera} style={styles.sideIcon} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.captureButton} onPress={takePicture} />

                    <TouchableOpacity style={styles.sideButton} onPress={() => router.push('/(components)/UserPost')}>
                        <Image source={images.pictureIcons} style={styles.sideIcon} />
                    </TouchableOpacity>
                </View>

            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    message: {
        textAlign: 'center',
        color: 'white',
        marginBottom: 20,
    },
    permissionButton: {
        alignSelf: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: 'white',
        borderRadius: 8,
    },
    permissionButtonText: {
        color: 'black',
        fontWeight: '600',
    },
    camera: {
        flex: 1,
    },
    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: 'black',
    },
    topTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        paddingLeft: 10,
    },
    closeButton: {
        width: 35,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeIcon: {
        width: 18,
        height: 18,
        tintColor: 'white',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 28,
        paddingBottom: 48,
        paddingTop: 20,
        backgroundColor: 'black',
    },
    sideButton: {
        width: 38,
        height: 38,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sideIcon: {
        width: 38,
        height: 38,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'white',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.5)',
    },
});
