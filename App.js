import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button, FlatList, TextInput } from "react-native";
import fetch_handled from "./src/queries";

import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Search from './screens/search';
import Course from './screens/course';
import Professor from './screens/professor'

const screen_stack = createStackNavigator();

const App = () => {
  const [course_list, setCourseList] = React.useState(null);
  const [dept_list, setDeptList] = React.useState(null);


  React.useEffect(() => {
    const fetchDataAsync = async () => {
      try {
        const course_data = await fetch_handled("https://api.umd.io/v1/courses/list");
        course_data_update = course_data.map(course => ({
          ...course,
          id: course.course_id,
          onClick: "course",
        }))
        setCourseList(course_data_update);
        // console.log(course_list);

        const dept_data = await fetch_handled("https://api.umd.io/v1/courses/departments");
        dept_data_update = dept_data.map(dept => ({
          ...dept,
          id: dept.dept_id,
          name: dept.department,
          onClick: "search",
        }))
        const unique_dept_ids = new Set();
        const unique_depts = dept_data_update.filter(dept => { 
          if (unique_dept_ids.has(dept.id)) {
            return false; // Duplicate, skip this course
          } else {
            unique_dept_ids.add(dept.id); // Add course_id to Set
            return true; // Unique, keep this course
          }
        });
  
  
        setDeptList(unique_depts);
        // console.log(dept_list);

      } catch (error) {
        console.error(error);
      }
    };

    fetchDataAsync();
  }, []);



  return (
    <NavigationContainer>
      <StatusBar></StatusBar>
      <screen_stack.Navigator>
        <screen_stack.Screen name="Search">
          {props => <Search {...props} course_list={course_list} dept_list={dept_list} />}
        </screen_stack.Screen>
        <screen_stack.Screen name="Course" component={Course} />
        <screen_stack.Screen name="Professor" component={Professor} />
      </screen_stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 100,
  },
});
export default App;
