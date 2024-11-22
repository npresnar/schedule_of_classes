import {
  Text,
  View,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { Badge } from "react-native-elements";
import React, { useState, useEffect, useRef } from "react";
import fetch_handled from "../src/queries";
import grade_bar from "../src/charts";
import numberWithCommas from "../src/formatting";
import { color } from "react-native-elements/dist/helpers";
import { createNativeWrapper } from "react-native-gesture-handler";
import { useNavigation } from '@react-navigation/native';


function Course({ route }) {
  const { course } = route.params;
  const [course_info, setCourseInfo] = useState("");
  const [section_info, setSectionInfo] = useState("");
  const [instructor_ratings, setInstructorRatings] = useState("");
  const [grade_cumm, setGradeCumm] = useState("");
  const [gpa, setGpa] = useState("");
  const [total_grades, setTotalGrades] = useState("");


  const navigation = useNavigation();


  React.useEffect(() => {
    const fetchDataAsync = async () => {
      try {
        const course_data = await fetch_handled(
          "https://api.umd.io/v1/courses/" + course
        );
        setCourseInfo(course_data[0]);

        const section_data = await fetch_handled(
          "https://api.umd.io/v1/courses/" + course + "/sections"
        );
        const sortedSections = section_data.sort((a, b) => {
          if (a.section_id < b.section_id) return -1;
          if (a.section_id > b.section_id) return 1;
          return 0;
        });
        setSectionInfo(sortedSections);

        /* FETCH INSTRUCTOR RATINGS */

        const uniqueInstructors = new Set();
        section_data.forEach((section) => {
          const { instructors } = section;
          if (instructors && instructors.length > 0) {
            instructors.forEach((instructor) => {
              uniqueInstructors.add(instructor);
            });
          }
        });
        const instructorRatingsPromises = Array.from(uniqueInstructors).map(
          (instructor) => {
            return fetch_handled(
              "https://planetterp.com/api/v1/professor?name=" + instructor
            );
          }
        );

        Promise.all(instructorRatingsPromises)
          .then((responses) => {
            const instructor_ratings_dict = {};
            responses.forEach((response, index) => {
              const instructor = Array.from(uniqueInstructors)[index];
              if (response.average_rating) {
                instructor_ratings_dict[instructor] = response.average_rating;
              } else {
                instructor_ratings_dict[instructor] = undefined;
              }
            });
            setInstructorRatings(instructor_ratings_dict);
          })
          .catch((error) => {
            // console.error('Error fetching instructor ratings:', error);
          });



          /* GRADE DATA */
          
          fetch("https://planetterp.com/api/v1/grades?course=" + course)
            .then(response => response.json())
            .then(data => {
              // Create a dictionary to store the sum of grades
              const gradeSum = {};
              total_count = 0;

              // Iterate over the array of objects
              data.forEach(item => {
                // Iterate over the grade categories
                Object.keys(item).forEach(key => {
                  // Skip non-grade keys like 'course', 'professor', etc.
                  if (!['course', 'professor', 'semester', 'section'].includes(key)) {
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

              // Print or use the gradeSum dictionary as needed
              setGradeCumm(gradeSum);
              setTotalGrades(total_count)

            })
            .catch(error => {
              console.error('Error fetching API:', error);
            });

            fetch("https://planetterp.com/api/v1/course?name=" + course)
            .then(response => response.json())
            .then(data => {
              setGpa(data.average_gpa);
            })






      } catch (error) {
        // console.error(error);
      }
    };
    fetchDataAsync();
  }, [course]);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const contentHeight = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get("window").width;


  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    Animated.timing(
      contentHeight,
      {
        toValue: isCollapsed ? screenWidth * 0.6 : 0, // Adjust height as needed
        duration: 300, // Adjust duration as needed
        useNativeDriver: false,
      }
    ).start();
  };


  const renderInstructors = ({ item }) => (
    <TouchableOpacity onPress={() => {
      navigation.push('Professor', {professor: item});
    }}>
      <View style={styles.instructor_container}>
        <Image
          source={require("../assets/planet_terp_logo.png")}
          style={styles.favicon}
        />
        <Text style={styles.professor_link}>
          {" "}
          {instructor_ratings[item]
            ? instructor_ratings[item].toFixed(2)
            : "N/A"}{" "}
        </Text>
        <Text //numberOfLines={2}
          style={styles.section_text}
        >
          {item}
        </Text>
      </View>
    </TouchableOpacity>
  );
  const renderMeetings = ({ item }) => (
    <View
      style={{
        ...styles.section_time,
        ...{
          backgroundColor:
            item.classtype == "Lab"
              ? color_pallete.lab_color
              : item.classtype == "Discussion"
              ? color_pallete.discussion_color
              : color_pallete.lecture_color,
        },
      }}
    >
      <Text style={styles.section_text}>
        {item.building} {item.room} {item.days == "" ? "" : "|" + item.days}
      </Text>
      <Text style={styles.section_text}>
        {item.start_time == "" ? "" : item.start_time + "-" + item.end_time}
      </Text>
    </View>
  );

  const renderSections = ({ item }) => {
    return item ? (
      <View style={styles.section_container}>
        <View>
          <Text style={styles.section_number_container}>{item.number}</Text>

            <View
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                paddingRight: 3,
              }}
            >
              <View style={styles.seat_progress_shadow_container}>
                <View style={styles.seat_progress_container}>
                  <View
                    style={{
                      ...styles.seat_progress_child,
                      ...{
                        width: `${(1 - item.open_seats / item.seats) * 100}%`,
                        backgroundColor: item.open_seats == 0 ? color_pallete.filled_class : color_pallete.full_seats,
                      },
                    }}
                  />
                  <View
                    style={{
                      height: item.waitlist > 0 ? 20 : 0,
                      width: `${(item.waitlist / item.seats) * 100}%`,
                      backgroundColor: color_pallete.yellow,
                      position: "absolute",
                    }}
                  ></View>
                </View>
              </View>

              <Text
                style={{
                  textAlign: "center",
                  position: "absolute",
                  margin: "auto",
                }}
              >
                {item.open_seats} / {item.seats}
              </Text>
            </View>

            <Text style={styles.waitlist_text}>Waitlist: {item.waitlist}</Text>
        </View>
        <View>
          <FlatList
            data={item.meetings}
            renderItem={renderMeetings}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
          />
        </View>
        <View>
          <FlatList
            data={item.instructors}
            renderItem={renderInstructors}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
          />
        </View>
      </View>
    ) : (
      <View></View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.column_container}>
        <Text style={styles.title}>
          {course_info.course_id
            ? course_info.course_id.substring(0, 4) +
              " " +
              course_info.course_id.substring(4)
            : ""}
        </Text>
        <Badge
          value={course_info.credits}
          badgeStyle={{ backgroundColor: color_pallete.credits }}
        />
      </View>
      <Text style={styles.subtitle}>{course_info.name}</Text>

      <View style={styles.description}>
        <Text>{course_info.description}</Text>
      </View>
      

      <View style={{display: 'flex', flexDirection: "row", justifyContent: "space-between"}}>
        <Text style={styles.gen_ed}>
          {course_info.gen_ed ? course_info.gen_ed.join(", ") : ""}
        </Text>



        <View style={{...styles.gpa_container, ...{
            backgroundColor: gpa >= 3.5 ? color_pallete.high_gpa : gpa >= 3 ? color_pallete.medium_gpa : gpa >= 2.5 ? color_pallete.low_gpa : gpa ? color_pallete.bad_gpa : color_pallete.no_gpa,
          }}}>
          <Text style={{textAlign: "center"}}>
            GPA: {gpa ? gpa.toFixed(2) : "N/A"}
          </Text>
        </View>
      </View>


      

      <View style={styles.dropdown_container}>
        <TouchableOpacity onPress={toggleCollapse}>
          <View style={{
                borderBottomWidth: isCollapsed ? 0 : 1,
                borderColor: color_pallete.light_borders,
          }}>
            <Text style={styles.dropdown_text}>{isCollapsed ? 'Show Grade Distribution' : 'Hide Grade Distribution'}</Text>
          </View>
        </TouchableOpacity>
        <Animated.View style={{ 
            height: contentHeight, 
            overflow: 'hidden' ,
          }}>
          <Text style={styles.chart_title}>Grade distribution across {numberWithCommas(total_grades)} students</Text>
          {grade_bar(grade_cumm)}
        </Animated.View>
      </View>



      <View style={{ flex: 1 }}>
        <FlatList
          data={section_info}
          renderItem={renderSections}
          keyExtractor={(item) => item.section_id}
          scrollEnabled={false}
          style={styles.sections_list}
        />
      </View>
    </ScrollView>
  );
}

const color_pallete = {
  red: "rgb(255,59,48)",
  title_text: "rgb(11, 43, 60)",
  green: "rgb(52,199,89)",

  full_seats: "lightblue",
  empty_seats: "white",
  filled_class: "rgb(230,173,173)",
  waitlist_seats: "rgb(255,214,10)",

  borders: "#555",
  grey_text: "#1F3F3F",
  credits: "rgb(255,204,0)",
  light_grey: "rgb(142,142,147)",
  defaul_bg: "rgb(242,242,242)",
  lecture_color: "rgba(199,199,204,0.2)",
  discussion_color: "rgba(255,204,0,0.2)",
  lab_color: "rgba(255,59,48,0.2)",
  light_borders: 'lightgrey',

  link_text: "rgb(138,180,247)",

  high_gpa: "rgb(134, 214, 133)",
  medium_gpa: "rgb(214, 214, 133)",
  low_gpa: "rgb(214, 194, 133)",
  bad_gpa: "rgb(214, 133, 133)",
  no_gpa: "rgb(202,202,207)",
};

const styles = StyleSheet.create({
  column_container: {
    flexDirection: "row", // Arrange children horizontally
    justifyContent: "space-between", // Space between columns
    alignItems: "center",
  },
  container: {
    padding: 20,
  },
  title: {
    fontWeight: "bold",
    fontSize: 40,
    color: color_pallete.title_text,
  },
  subtitle: {
    fontWeight: "bold",
    fontSize: 20,
    color: color_pallete.grey_text,
    marginBottom: 5,
  },
  section_container: {
    padding: 10,
    borderRadius: 5,
    borderColor: color_pallete.borders,
    borderWidth: 0.2,
    marginBottom: 5,
    flexDirection: "row", // Arrange children horizontally
    justifyContent: "space-between", // Space between columns
    alignItems: "center",
  },
  sections_list: {
    marginBottom: 50,
  },
  description: {
    marginBottom: 10,
  },
  gen_ed: {
    marginBottom: 5,
  },
  seat_progress_shadow_container: {
    shadowColor: "#000",
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5, // Android
  },
  seat_progress_container: {
    backgroundColor: color_pallete.empty_seats,
    height: 20,
    width: 100,
    justifyContent: "flex-start",
    flexDirection: "row",
    borderRadius: 999999,
    overflow: "hidden",
    alignItems: "center",
  },
  seat_progress_child: {
    height: 20,
  },
  section_number_container: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 5,
  },
  waitlist_text: {
    textAlign: "center",
    marginTop: 5,
    fontSize: 12,
  },
  favicon: {
    width: 20, // Set width of the image
    height: 20, // Set height of the image
    resizeMode: "contain", // Maintain aspect ratio and fit within dimensions
  },
  instructor_container: {
    flexDirection: "row",
    justifyContent: "flex-start",
    flex: 1,
    width: "40%",
    marginBottom: 10,
  },
  section_time: {
    padding: 4,
    borderRadius: 5,
    margin: 1,
    marginLeft: 5,
    marginRight: 5,


    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 0.5,
    elevation: 5, // Android
  },
  section_text: {
    fontSize: 12,
  },
  professor_link: {
    color: color_pallete.link_text,
    fontSize: 12,
    // textDecorationLine: 'underline',
  },
  dropdown_button: {
    borderBottomWidth: 1,
    borderColor: color_pallete.light_borders
  },
  dropdown_text: {
    textAlign: "center",
    margin: 5,
    fontStyle: 'italic'
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
  chart_title: {
    textAlign: "center",
    marginVertical: 10,
    fontWeight: 'bold'
  },
  gpa_container: {
    borderRadius: 99999,
    padding:2,
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

  }
});

export default Course;
