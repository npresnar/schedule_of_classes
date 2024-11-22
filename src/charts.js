import React from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import { StackedBarChart } from "react-native-chart-kit";

const grade_bar = (grade_data) => {
  const grade_percentage = {};
  total_count = 0;
  Object.keys(grade_data).forEach((key) => {
    total_count += grade_data[key];
  });

  Object.keys(grade_data).forEach((key) => {
    grade_percentage[key] = (grade_data[key] / total_count) * 100;
  });

  const screenWidth = Dimensions.get("window").width;

  const passing_bar_colors = [
    "rgba(86,126,85,0.8)",
    "rgba(150,197,149,0.8)",
    "rgba(186,239,183,0.8)",
  ];

  const data = {
    labels: ["A", "B", "C", "D", "F", "W", "Other"],
    legend: ["+", " ", "-"],
    data: [
      [0,0,grade_percentage["A+"], grade_percentage["A"], grade_percentage["A-"]],
      [0,0,grade_percentage["B+"], grade_percentage["B"], grade_percentage["B-"]],
      [0,0,grade_percentage["C+"], grade_percentage["C"], grade_percentage["C-"]],
      [0,0,grade_percentage["D+"], grade_percentage["D"], grade_percentage["D-"]],
      [0,grade_percentage["F"]],
      [0,grade_percentage["W"]],
      [grade_percentage["Other"]],
    ],
    barColors: [
      "rgb(170,170,170)",
      "rgb(239,98,91)",
      "rgba(86,126,85,0.8)",
      "rgba(150,197,149,0.8)",
      "rgba(186,239,183,0.8)",
    ],
  };

  const color_pallete = {
    defaul_bg: "rgb(242,242,242)",
    grey_text: "rgb(31,63,63)",
    borders: "#555",

  };

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <StackedBarChart
        style={{
          marginVertical: 8,
          borderRadius: 16,
          marginLeft: -(screenWidth * 0.25),
        }}
        data={data}
        width={screenWidth}
        height={screenWidth * 0.6}
        chartConfig={{
          backgroundGradientFrom: color_pallete.defaul_bg,
          backgroundGradientTo: color_pallete.defaul_bg,
          color: (opacity = 1) => color_pallete.grey_text,

          barPercentage: 0.8,
          propsForBackgroundLines: {
            stroke: 0,
          },
        }}
        withHorizontalLabels={false}
        hideLegend={true}
      />
    </View>
  );
};
export default grade_bar;
