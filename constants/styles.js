import { StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export const styles = StyleSheet.create({
    container: { flex: 1, borderRadius: 20, marginTop: -15 },
    gradientContainer: { flex: 1, borderRadius: 20, marginTop: -15, overflow: 'hidden' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: 'white', fontSize: 22, fontFamily: 'poppins-semibold' },
    overviewContainer: { flex: 1, justifyContent: 'center' },
    overviewTitle: { color: 'white', fontSize: 40, fontFamily: 'poppins-bold', marginHorizontal: 20 },
    repsText: { color: '#8AFFF9', fontSize: 40, fontFamily: 'poppins-semibold', marginHorizontal: 20, marginTop: 10, marginBottom: 20 },
    header: {
        width: '100%',
        height: 300,
        backgroundColor: 'black',
    },
    video: {
        ...StyleSheet.absoluteFillObject,
    },
    workoutCard: { padding: 30 },
    exerciseNameMain: { fontFamily: 'poppins-semibold', fontStyle: 'italic', color: 'white', fontSize: 40 },
    repsContainer: { flexDirection: 'row', alignItems: 'baseline', marginTop: 10 },
    repsSetsMain: { fontFamily: 'poppins-semibold', fontSize: 64, color: '#8AFFF9' },
    repsLabel: { fontFamily: 'poppins-semibold', fontSize: 24, color: '#8AFFF9' },
    bodyweightText: { marginTop: 40, fontFamily: 'poppins-medium', color: 'white', fontSize: 24 },
    weightText: { fontFamily: 'poppins-light', color: 'white', fontSize: 19 },
    nextButtonOverview: {
        backgroundColor: 'white',
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 20
    },
    nextButtonWorkout: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 40
    },
    nextButtonText: { color: '#271293', fontSize: 20, fontFamily: 'poppins-bold' },
    nextButtonTextWorkout: { color: 'white', fontSize: 20, fontFamily: 'poppins-bold' },
    streakContainer: { alignItems: 'center', marginTop: 40 },
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
        width: '90%', // Make it slightly less than full width
        backgroundColor: 'rgba(255, 255, 255, 0.3)', // A semi-transparent white
        borderRadius: 5,
        marginTop: 20, // Space from the top of the screen
        alignSelf: 'center', // Center it
        overflow: 'hidden', // Ensures the inner bar respects the border radius
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#FFFFFF', // A solid white for the filled portion
        borderRadius: 5,
    },
});

