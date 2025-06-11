import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native'
import React, { useState } from 'react'
import images from "@/constants/images"
import icons from '@/constants/icons'
import { router } from 'expo-router'
import CustomButton from '@/components/CustomButton'

const Playlist = () => {
    const [showInfoModal, setShowInfoModal] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Image source={icons.arrow} />
                </TouchableOpacity>
                <Text style={styles.headerText}>Back</Text>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 20, marginBottom: 20 }}>
                <Text style={{ fontFamily: 'poppins-semibold', fontSize: 24, color: 'white' }}>Gym playlist</Text>
                {/** the icon will go here once I have it */}
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'poppins-medium', fontSize: 14, color: '#CDCDE0', marginTop: 30 }}>connect to</Text>
                <Image source={images.spotify} />
                <Image source={images.appleMusic} />
                <Text style={{ fontFamily: 'poppins-semibold', fontSize: 20, color: '#DAEEED', marginTop: 20 }}>COMING SOON</Text>
                <CustomButton
                    title="Learn more"
                    handlePress={() => setShowInfoModal(true)}
                    buttonStyle={{
                        backgroundColor: 'rgba(217, 217, 217, 0.5)',
                        borderRadius: 8,
                        paddingVertical: 16,
                        paddingHorizontal: 38,
                        //marginHorizontal: 38,
                        marginTop: 30,
                        justifyContent: "center"
                    }}
                    textStyle={{
                        color: '#FFFFFF',
                        fontSize: 16,
                        fontFamily: 'poppins-semiBold'
                    }}
                />
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={showInfoModal}
                onRequestClose={() => setShowInfoModal(false)}
            >
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                }}>
                    <View style={{
                        backgroundColor: '#D9D9D9',
                        padding: 20,
                        borderRadius: 10,
                        width: '80%',
                        shadowColor: '#000',
                        shadowOpacity: 0.5,
                        shadowRadius: 10,
                    }}>
                        <TouchableOpacity style={{ position: 'absolute', top: 10, right: 10 }} onPress={() => setShowInfoModal(false)}>
                            <Image source={icons.x} className="w-10 h-10" />
                        </TouchableOpacity>
                        <Text style={{
                            fontSize: 30,
                            fontWeight: 'bold',
                            color: 'black',
                            marginBottom: 10,
                            fontFamily: 'poppins-semibold',
                        }}>
                            Want to share and find gym playlists?
                        </Text>
                        <Text style={{ color: 'black', fontFamily: 'poppins-medium' }}>
                            Want an upbeat playlist? Need something to fuel your heartbeat? Whatever it is your lifts desire, you will find it here
                        </Text>
                        <Text style={{ color: '#5D9A97', fontFamily: 'poppins', fontWeight: 'bold', marginTop: 10, paddingTop: 20, textAlign: 'center', fontSize: 27, paddingHorizontal: 20, lineHeight: 16.2 }}>HANG TIGHT COMMING SOON</Text>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default Playlist

export const styles = StyleSheet.create({
    container: {
        height: '100%',
        backgroundColor: '#000000',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        paddingTop: 40
    },
    headerText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    }
})