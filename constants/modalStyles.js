import { StyleSheet, Platform } from 'react-native';

export const modalStyles = StyleSheet.create({
    modelContainer: {
        flex: 1,
        marginTop: 60,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    dateModalContainer: {
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '95%',
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    modalHeader: {
        paddingTop: 12,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    modalHandle: {
        width: 40,
        height: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 16,
    },
    modalCloseButton: {
        position: 'absolute',
        right: 20,
        top: 20,
    },
    modalCloseText: {
        fontSize: 17,
        color: '#38FFF5',
        fontWeight: '600',
    },
    modalScroll: {
        paddingHorizontal: 16,
    },
    
    // Filter Tabs
    filterTabs: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24,
    },
    filterTab: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    filterTabActive: {
        backgroundColor: 'rgba(76, 217, 100, 0.2)',
        borderColor: '#4CD964',
    },
    filterTabText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 13,
        fontWeight: '500',
    },
    filterTabTextActive: {
        color: '#4CD964',
        fontSize: 13,
        fontWeight: '600',
    },
    
    // Calendar Section
    calendarSection: {
        marginBottom: 24,
    },
    weekDaysHeader: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    weekDayText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
        fontWeight: '600',
        width: 42,
        textAlign: 'center',
    },
    
    // Calendar Grid
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    dayCell: {
        width: 42,
        height: 56,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    dayNumber: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    futureDayNumber: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 16,
        fontWeight: '500',
    },
    lockIcon: {
        fontSize: 12,
    },
    todayCell: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    todayText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    
    // Legend
    legendSection: {
        marginBottom: 24,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendColor: {
        width: 32,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4CD964',
    },
    legendText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 13,
        fontWeight: '500',
    },
    
    // Full Week Button
    fullWeekButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 14,
        borderRadius: 24,
        marginTop: 20,
        gap: 8,
        marginBottom: 10,
    },
    fullWeekButtonIcon: {
        fontSize: 18,
    },
    fullWeekButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});