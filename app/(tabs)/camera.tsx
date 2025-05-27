import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import {
    Button,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    SafeAreaView,
    Image
} from 'react-native';
import images from "@/constants/images";
import icons from "@/constants/icons";
import { router } from "expo-router";
import { useGlobal } from "@/context/GlobalProvider";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function App() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<any>(null);
    const { userData, ngrokAPI } = useGlobal();

    // Handle camera permissions
    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="Grant permission" />
            </View>
        );
    }

    // Toggle between front and back camera
    function toggleCameraFacing() {
        setFacing((current) => (current === 'back' ? 'front' : 'back'));
    }

    // Capture, save the image to the database, and then route to the user images page
    const takePicture = async () => {
        if (!userData?._id) {
            console.error('No user ID available');
            return;
        }

        if (cameraRef.current) {
            try {
                // Capture the image
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.7,
                    base64: true
                });

                console.log('Photo captured:', photo.uri);
                const UserID =  userData?._id;
                const image = photo.uri;

                const token = await AsyncStorage.getItem("token");
                if (!token) {
                    console.error("No authentication token found");
                    return;
                }

                // Create FormData
                const formData = new FormData();
                formData.append('image', {
                    uri: photo.uri,
                    type: 'image/jpeg',
                    name: 'photo.jpg'
                } as any);
                formData.append('UserID', userData._id);
                formData.append('token', token);

                // Configure axios headers for FormData
                const config = {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                };

                // Upload the image
                const response = await axios.post(`${ngrokAPI}/upload`,{image, UserID});

                if (response.data.status === 'success') {
                    console.log("Upload successful. Image URL:", response.data.data.url);
                    // Navigate to the user images page after successful upload
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
            {/* Camera Preview */}
            <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
                {/* 3×3 Grid Overlay */}
                <View style={styles.gridOverlay}>
                    {/* Horizontal lines */}
                    <View style={[styles.gridLine, { top: '33%', left: 0, right: 0, height: 1 }]} />
                    <View style={[styles.gridLine, { top: '66%', left: 0, right: 0, height: 1 }]} />
                    {/* Vertical lines */}
                    <View style={[styles.gridLine, { left: '33%', top: 0, bottom: 0, width: 1 }]} />
                    <View style={[styles.gridLine, { left: '66%', top: 0, bottom: 0, width: 1 }]} />
                </View>

                {/* Top Bar with Title and Close Button */}
                <SafeAreaView style={styles.topBar}>
                    <Text style={styles.topTitle}>Capture.</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={() => router.push('/home')}>
                        <Image source={icons.x} className="w-10 h-10"/>
                    </TouchableOpacity>
                </SafeAreaView>

                {/* Bottom Bar for Controls */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
                        <Image source={images.flipCamera} className="w-10 h-10"/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                        <Image source={images.aperture} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconButton]} onPress={() => router.push('/(components)/UserPost')}>
                        <Image source={images.pictureIcons} className="w-10 h-10"/>
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
    camera: {
        flex: 1,
    },
    gridOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    gridLine: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    topBar: {
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: "black",
    },
    topTitle: {
        color: 'white',
        paddingLeft: 30,
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 20,
    },
    closeText: {
        color: 'white',
        fontSize: 20,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 40,
        backgroundColor: 'black',
    },
    iconButton: {
        padding: 8,
    },
    captureButton: {
        padding: 12,
    },
});