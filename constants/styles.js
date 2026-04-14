import { StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export const styles = StyleSheet.create({
    container: { flex: 1, borderRadius: 20, marginTop: -15 },
    gradientContainer: { flex: 1, borderRadius: 20, marginTop: -15, overflow: 'hidden' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: 'white', fontSize: 22, fontFamily: 'poppins-semibold' },
    overviewContainer: { flex:1 },
    overviewTitle: { color: 'white', fontSize: 40, fontFamily: 'raleway-light', marginHorizontal: 20, alignContent:'center'},
    repsText: { color: '#6477E7', fontSize: 40, fontFamily: 'poppins-semibold', marginHorizontal: 20, marginTop: 10, marginBottom: 20 },
    header: {
        width: '100%',
        height: 300,
        backgroundColor: 'black',
    },
    video: {
        ...StyleSheet.absoluteFillObject,
    },
    workoutCard: { padding: 20 },
    exerciseNameMain: { fontFamily: 'raleway-light', color: 'white', fontSize: 34 },
    repsContainer: { flexDirection: 'row', alignItems: 'baseline'},
    repsSetsMain: { fontFamily: 'poppins-regular', fontSize: 18, color: '#6477E7' },
    repsLabel: { fontFamily: 'poppins-semibold', fontSize: 24, color: '#8AFFF9' },
    bodyweightText: { marginTop: 40, fontFamily: 'poppins-medium', color: 'white', fontSize: 24 },
    weightText: { fontFamily: 'poppins-light', color: 'white', fontSize: 19 },
    nextButtonOverview: {
        backgroundColor: '#1B191E',
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 20
    },
    nextButtonWorkout: {
        backgroundColor: '#1B191E',
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 10
    },
    nextButtonText: { color: 'white', fontSize: 20, fontFamily: 'poppins-bold' },
    nextButtonTextWorkout: { color: 'white', fontSize: 20, fontFamily: 'poppins-bold' },
    streakContainer: { alignItems: 'center',  flex: 1, justifyContent: 'flex-end' , marginBottom: 30},
    endButton: {
        backgroundColor: '#C0C0C0', // A neutral color to differentiate from 'Start'
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 30,
        marginTop: 20, // Add some space between the buttons
        alignSelf: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    endButtonText: {
        color: '#000000',
        fontSize: 20,
        fontWeight: 'bold',
    },
    progressBarContainer: {
        height: 10,
        width: '60%', // Make it slightly less than full width
        backgroundColor: '#1B191E', // A semi-transparent white
        borderRadius: 5,
        marginLeft: 20,
        marginRight: 20,
        alignSelf: 'center', // Center it
        overflow: 'hidden', // Ensures the inner bar respects the border radius
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#FFFFFF', // A solid white for the filled portion
        borderRadius: 5,
    },
});

