import 'react-native-gesture-handler';
import { createStackNavigator } from '@react-navigation/stack';
import { createAppContainer } from '@react-navigation/native';
import Search from '../screens/search';
import Course from '../screens/course';
import Professor from '../screens/professor'


const screen_stack = createStackNavigator({
    Search: {
        screen: Search
    }, 
    Course: {
        screen: Course
    },
    Professor: {
        screen: Professor
    },
});

export default createAppContainer(screen_stack);