import React, { useState, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Dimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

function Search({ course_list, dept_list }) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();

  const screenWidth = Dimensions.get("window").width;

  const flatListRef = useRef(null);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const contentHeight = useRef(new Animated.Value(0)).current;

  const [gen_ed_titles, setGenEdTitles] = useState({
    "Fundamental Studies": {
      names: ["FSAW", "FSAR", "FSMA", "FSOC", "FSPW"],
      button_states: [false, false, false, false, false],
    },
    "Distributive Studies": {
      names: ["DSHS", "DSHU", "DSNS", "DSNL", "DSSP"],
      button_states: [false, false, false, false, false],
    },
    Diversity: {
      names: ["DVCC", "DVUP"],
      button_states: [false, false],
    },
    "Signature Courses": {
      names: ["SCIS"],
      button_states: [false],
    },
  });

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    Animated.timing(contentHeight, {
      toValue: isCollapsed ? screenWidth * 0.2 : 0, // Adjust height as needed  
      duration: 300, // Adjust duration as needed
      useNativeDriver: false,
    }).start();
  };

  // Function to handle text input change
  const handleInputChange = (text) => {
    setSearchQuery(text);
    flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
  };

  // Filtered course list based on the search query
  const filteredCourseList =
    searchQuery.length > 0
      ? course_list?.filter((course) => {
          return course.id.toLowerCase().startsWith(searchQuery.toLowerCase());
        }) || []
      : dept_list;

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <TextInput
          style={styles.input}
          placeholder="Search Course ID"
          onChangeText={handleInputChange}
          value={searchQuery}
          clearButtonMode="always" // IOS Only
          autoCorrect={false}
        />

        <View style={styles.gen_ed_container}>
          <TouchableOpacity onPress={toggleCollapse}>
            <View
              style={{
                borderBottomWidth: isCollapsed ? 0 : 1,
                borderColor: color_pallete.light_borders,
                marginHorizontal: 5,
                alignItems: "center",
              }}
            >
              <Text style={styles.gen_ed_title}>
                {isCollapsed ? "Show " : "Hide "}Gen-Ed Filters
              </Text>
            </View>
          </TouchableOpacity>

          <Animated.View
            style={{
              height: contentHeight,
              overflow: "hidden",
            }}
          >
            {/* <FlatList 
              data={Object.entries(gen_ed_titles).map(([key, value]) => ({ key, value }))}
              keyExtractor={(item) => item.key}

            /> */}
            <FlatList
              scrollEnabled={false}
              keyboardShouldPersistTaps="handled"
              data={gen_ed_titles["Fundamental Studies"]["names"]}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => {
                    const newGenEdTitles = { ...gen_ed_titles };
                    newGenEdTitles["Fundamental Studies"]["button_states"][
                      index
                    ] =
                      !newGenEdTitles["Fundamental Studies"]["button_states"][
                        index
                      ];
                    setGenEdTitles(newGenEdTitles);
                    console.log(gen_ed_titles); 
                  }}
                >
                  <View
                    style={{
                      backgroundColor: gen_ed_titles["Fundamental Studies"][
                        "button_states"
                      ][index]
                        ? color_pallete.selected_gen_ed
                        : color_pallete.deselected_gen_ed,
                      display: 'flex'
                    }}
                  >
                    <Text>{item}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </Animated.View>
        </View>
        
        
        <FlatList
          scrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          ref={flatListRef}
          data={filteredCourseList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                if (item.onClick == "course") {
                  navigation.push("Course", { course: item.id });
                } else {
                  setSearchQuery(item.id);
                  flatListRef.current.scrollToOffset({
                    animated: false,
                    offset: 0,
                  });
                }
              }}
            >
              <View style={styles.item}>
                <Text>
                  <Text
                    style={{
                      color: item.onClick == "course" ? "red" : "blue",
                    }}
                  >
                    {item.id}
                  </Text>{" "}
                  - {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const color_pallete = {
  light_borders: "lightgrey",
  selected_gen_ed: 'green',
  deselected_gen_ed: 'lightblue',
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40, // To avoid covering the input with the status bar
  },
  input: {
    height: 40,
    width: "100%",
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  listContent: {
    flexGrow: 1,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  gen_ed_title: {
    textAlign: "center",
    marginVertical: "auto",
    fontStyle: "italic",
    marginVertical: 5,
  },
  gen_ed_container: {
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 3,
    borderColor: color_pallete.light_borders,
  },
});

export default Search;
