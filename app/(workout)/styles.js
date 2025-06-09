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
});