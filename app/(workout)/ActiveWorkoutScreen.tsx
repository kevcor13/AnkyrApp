import { View, Text } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'

const ActiveWorkoutScreen = () => {
    return (
        <LinearGradient
            colors={['#FF3C3C', '#A12287', '#1F059D']} // Gradient colors
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
        >

        </LinearGradient>
    )
}

export default ActiveWorkoutScreen