import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { LineChart } from "react-native-svg-charts";
import { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import * as shape from "d3-shape";

interface WeeklyPoint {
  date: moment.MomentInput;
  points: number;
}

interface GraphViewProps {
  weeklyData: WeeklyPoint[];
}

const GraphView: React.FC<GraphViewProps> = ({ weeklyData }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (weeklyData && weeklyData.length > 0) {
      setSelectedIndex(weeklyData.length - 1);
    }
  }, [weeklyData]);

  const displayedPoints =
    selectedIndex !== null && weeklyData[selectedIndex]
      ? weeklyData[selectedIndex].points
      : 0;

  const Gradient = () => (
    <Defs key={"gradient"}>
      <LinearGradient id={"gradient"} x1={"0%"} y1={"0%"} x2={"0%"} y2={"100%"}>
        <Stop offset={"0%"} stopColor={"#000DFF"} stopOpacity={1} />
        <Stop offset={"100%"} stopColor={"#000000"} stopOpacity={0.08} />
      </LinearGradient>
    </Defs>
  );

  const Decorator = ({ x, y, data }: { x: (index: number) => number; y: (value: number) => number; data: number[] }) => {
    if (selectedIndex === null) return null;
    const selectedValue = data[selectedIndex];
    return (
      <Circle
        cx={x(selectedIndex)}
        cy={y(selectedValue)}
        r={4}
        fill={"white"}
        stroke={"#000DFF"}
        strokeWidth={2}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.textHeader}>Your Activity</Text>
      {weeklyData.length > 0 ? (
        <View style={styles.chartContainer}>
          <View style={styles.xpCallout}>
            <Text style={styles.xpText}>+ {displayedPoints} XP</Text>
          </View>
          <View style={styles.customGridContainer}>
            {weeklyData.map((_, index) => (
              // Each vertical line is now a LinearGradient component
              <LinearGradient
                key={`grid-${index}`}
                colors={['rgba(106, 108, 122, 0)', 'rgba(194, 199, 224, 1)']}
                style={styles.gridLine}
              />
            ))}
          </View>
          <LineChart
            style={{ height: 120, zIndex: 1 }}
            data={weeklyData.map((item) => item.points)}
            svg={{ stroke: "#000DFF", strokeWidth: 2, fill: "url(#gradient)" }}
            contentInset={{ top: 20, bottom: 20, left: 20, right: 20 }}
            curve={shape.curveNatural}
          >
            <Gradient />
            <Decorator
                data={[]} 
                x={function (_index: number): number {
                    throw new Error("Function not implemented.");
                } } 
                y={function (_value: number): number {
                    throw new Error("Function not implemented.");
                } }            
            />
          </LineChart>

          {/* --- NEW: Horizontal line for the X-axis --- */}
          <View style={styles.axisLine} />

          <View style={styles.xAxisContainer}>
            {weeklyData.map((item, index) => {
              const isSelected = selectedIndex === index;
              return (
                <TouchableOpacity
                  key={`label-${index}`}
                  style={styles.xAxisLabelContainer}
                  onPress={() => setSelectedIndex(index)}
                >
                  <Text style={isSelected ? styles.xAxisLabelSelected : styles.xAxisLabel}>
                    {moment(item.date).format("dd")}
                  </Text>
                  <Text style={isSelected ? styles.xAxisLabelSelected : styles.xAxisLabel}>
                    {moment(item.date).format("DD")}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : (
        <Text style={styles.noDataText}>No workout data available for the week.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: "#000000",
    },
    textHeader: {
        color: "white",
        fontSize: 20,
        fontFamily: 'poppins-semibold',
        margin: 10,
    },
    chartContainer: {
        position: "relative",
        height: 160, 
        borderRadius: 8,
        paddingVertical: 10,
    },
    xpCallout: {
        position: "absolute",
        right: 10,
        top: 10,
        backgroundColor: "rgba(81, 76, 119, 0.74)",
        borderRadius: 15,
        paddingVertical: 10,
        paddingHorizontal: 10,
        zIndex: 10,
    },
    xpText: {
        color: "#8AFFF9",
        fontSize: 15,
        fontFamily: 'raleway-semibold',
    },
    customGridContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingVertical: 30, 
    },
    gridLine: {
        width: 1,
        backgroundColor: 'rgba(194, 199, 224, 1)',
    },
    // New style for the horizontal axis line
    axisLine: {
        position: 'absolute',
        bottom: 35, // Positioned 35px from the bottom of the container
        left: 20,   // Aligns with horizontal content inset
        right: 20,  // Aligns with horizontal content inset
        height: 1,
        backgroundColor: 'rgba(194, 199, 224, 1)', // Same color as grid lines
    },
    xAxisContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        position: 'absolute',
        bottom: 5, // Moved up slightly to make space below the labels
        left: 0,
        right: 0,
    },
    xAxisLabelContainer: {
        alignItems: 'center',
    },
    xAxisLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
    },
    xAxisLabelSelected: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    noDataText: {
        color: "white",
        textAlign: "center",
        marginTop: 20,
    },
});

export default GraphView;