import React, { useState, useEffect, useRef } from "react";
import Stars from "react-native-stars";
import grade_bar from "../src/charts";
import numberWithCommas from "../src/formatting";
import {
  Text,
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

function Professor({ route }) {
  const { professor } = route.params;
  const [professor_data, setProfessorData] = useState("");
  const [grade_cumm, setGradeCumm] = useState("");
  const [gpa, setGpa] = useState();
  const [total_grades, setTotalGrades] = useState("");

  const [isCollapsed, setIsCollapsed] = useState(true);
  const contentHeight = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get("window").width;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchDataAsync = async () => {
      fetch(
        "https://planetterp.com/api/v1/professor?name=" +
          professor +
          "&reviews=true"
      )
        .then((response) => response.json())
        .then((data) => {
          setProfessorData(data);
        })
        .catch((error) => {
          console.error(error);
        });

      fetch("https://planetterp.com/api/v1/grades?professor=" + professor)
        .then((response) => response.json())
        .then((data) => {
          // Create a dictionary to store the sum of grades
          const gradeSum = {};
          total_count = 0;

          // Iterate over the array of objects
          data.forEach((item) => {
            // Iterate over the grade categories
            Object.keys(item).forEach((key) => {
              // Skip non-grade keys like 'course', 'professor', etc.
              if (
                !["course", "professor", "semester", "section"].includes(key)
              ) {
                // If the grade category doesn't exist in the dictionary, initialize it to 0
                if (!gradeSum[key]) {
                  gradeSum[key] = 0;
                }
                // Add the grade count to the corresponding category in the dictionary
                gradeSum[key] += item[key];
                total_count += 1;
              }
            });
          });
          setGradeCumm(gradeSum);
          setGpa(
            (4 * gradeSum["A+"] +
              4 * gradeSum["A"] +
              3.7 * gradeSum["A-"] +
              3.3 * gradeSum["B+"] +
              3 * gradeSum["B"] +
              2.7 * gradeSum["B-"] +
              2.3 * gradeSum["C+"] +
              2 * gradeSum["C"] +
              1.7 * gradeSum["C-"] +
              1.3 * gradeSum["D+"] +
              1 * gradeSum["D"] +
              0.7 * gradeSum["D-"] +
              0 * gradeSum["F"] +
              0 * gradeSum["W"]) /
              (total_count - gradeSum["Other"])
          );
          setTotalGrades(total_count);
        })
        .catch((error) => {
          console.error("Error fetching API:", error);
        });
    };
    fetchDataAsync();
  }, [professor]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    Animated.timing(contentHeight, {
      toValue: isCollapsed ? screenWidth * 0.6 : 0, // Adjust height as needed
      duration: 300, // Adjust duration as needed
      useNativeDriver: false,
    }).start();
  };

  const renderReview = ({ item }) => (
    <View style={styles.review_container}>
      <View style={styles.review_header}>
        <View>
          <TouchableOpacity
            onPress={() => {
              navigation.push("Course", { course: item.course });
            }}
          >
            <Text style={styles.course_link}>{item.course}</Text>
          </TouchableOpacity>
          <Stars
            display={item.rating}
            spacing={5}
            count={5}
            starSize={15}
            fullStar={require("../assets/full_star.png")}
            emptyStar={require("../assets/empty_star.png")}
          />
        </View>
        {item.expected_grade == "" ? (
          <View />
        ) : (
          <Text>
            {"Expecting a" +
              (["A", "F"].includes(item.expected_grade.charAt(0))
                ? "n "
                : " ") +
              item.expected_grade}
          </Text>
        )}
        <Text>
          {new Date(item.created)
            .toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
            .replace(/\//g, "-")}
        </Text>
      </View>

      <View>
        <Text>{item.review}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.main}>
      <Text style={styles.title}>{professor}</Text>

      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 15,
        }}
      >
        <View style={{ alignItems: "flex-start" }}>
          <Text style={styles.rating_text}>
            Average rating:{" "}
            {professor_data.average_rating
              ? professor_data.average_rating.toFixed(2)
              : "N/A"}
          </Text>
          {professor_data.average_rating ? (
            <Stars
              display={professor_data.average_rating}
              spacing={8}
              count={5}
              starSize={20}
              fullStar={require("../assets/full_star.png")}
              emptyStar={require("../assets/empty_star.png")}
            />
          ) : (
            <View />
          )}
        </View>

        <View
          style={{
            ...styles.gpa_container,
            ...{
              backgroundColor:
                gpa >= 3.5
                  ? color_pallete.high_gpa
                  : gpa >= 3
                  ? color_pallete.medium_gpa
                  : gpa >= 2.5
                  ? color_pallete.low_gpa
                  : gpa
                  ? color_pallete.bad_gpa
                  : color_pallete.no_gpa,
            },
          }}
        >
          <Text style={{ textAlign: "center" }}>
            GPA: {gpa ? gpa.toFixed(2) : "N/A"}
          </Text>
        </View>
      </View>

      <View style={styles.dropdown_container}>
        {/* <TouchableOpacity onPress={toggleCollapse}>
          <View
            style={{
              borderBottomWidth: isCollapsed ? 0 : 1,
              borderColor: color_pallete.light_borders,
            }}
          >
            <Text style={styles.dropdown_text}>
              {isCollapsed
                ? "Show Grade Distribution"
                : "Hide Grade Distribution"}
            </Text>
          </View>
        </TouchableOpacity> */}
        <View
          style={{
            height: screenWidth * 0.7,
            overflow: "hidden",
          }}
        >
          {/* <Animated.View
            style={{
              height: contentHeight,
              overflow: "hidden",
            }}
          > */}
          <Text style={styles.chart_title}>
            Grade distribution across {numberWithCommas(total_grades)} students
          </Text>
          {grade_bar(grade_cumm)}
          {/* </Animated.View> */}
        </View>
      </View>

      <Text style={styles.reviews_title}>
        Reviews ({professor_data ? professor_data.reviews.length : "N/A"}):
      </Text>
      <View>
        <FlatList
          data={
            professor_data && professor_data.reviews
              ? professor_data.reviews.sort((a, b) => {
                  const dateA = new Date(a.created);
                  const dateB = new Date(b.created);

                  return dateB - dateA;
                })
              : []
          }
          renderItem={renderReview}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={false}
          style={{ marginBottom: 40 }}
        />
      </View>
    </ScrollView>
  );
}
const color_pallete = {
  title_text: "rgb(11, 43, 60)",
  grey_text: "#1F3F3F",
  defaul_bg: "rgb(242,242,242)",
  light_borders: "lightgrey",

  borders: "#555",

  high_gpa: "rgb(134, 214, 133)",
  medium_gpa: "rgb(214, 214, 133)",
  low_gpa: "rgb(214, 194, 133)",
  bad_gpa: "rgb(214, 133, 133)",
  no_gpa: "rgb(202,202,207)",

  grey_text: "#1F3F3F",
  link_text: "rgb(108,140,247)",
};

const styles = StyleSheet.create({
  main: {
    padding: 20,
  },
  title: {
    fontWeight: "bold",
    fontSize: 40,
    color: color_pallete.title_text,
    marginBottom: 10,
  },
  dropdown_button: {
    borderBottomWidth: 1,
    borderColor: color_pallete.light_borders,
  },
  dropdown_text: {
    textAlign: "center",
    margin: 5,
    fontStyle: "italic",
  },
  dropdown_container: {
    borderWidth: 1,
    padding: 3,
    borderRadius: 3,
    borderColor: color_pallete.light_borders,

    marginBottom: 15,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 0.3,
    elevation: 5, // Android
  },
  gpa_container: {
    borderRadius: 99999,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
    width: 90,
    marginBottom: 15,
    borderWidth: 0.5,
    borderColor: color_pallete.borders,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 5, // Android
  },
  rating_text: {
    marginBottom: 10,
    fontSize: 17,
    color: color_pallete.grey_text,
  },
  chart_title: {
    textAlign: "center",
    marginVertical: 10,
    fontWeight: "bold",
  },
  reviews_title: {
    fontWeight: "bold",
    fontSize: 20,
    color: color_pallete.grey_text,
    marginBottom: 15,
  },
  review_container: {
    padding: 10,
    borderRadius: 5,
    borderColor: color_pallete.borders,
    borderWidth: 0.2,
    marginBottom: 5,
  },
  review_header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  course_link: {
    color: color_pallete.link_text,
    // textDecorationLine: "underline",
    fontWeight: "bold",
    marginBottom: 5,
  },
});

export default Professor;
