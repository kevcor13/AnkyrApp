import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'


// @ts-ignore
const CustomButton = ({handlePress, title, buttonStyle, textStyle} ) => {
    return (
        <TouchableOpacity style={buttonStyle}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View className="flex flex-row items-center justify-center">
                <Text style={textStyle}>{title}</Text>
            </View>
        </TouchableOpacity>
    )
}
export default CustomButton