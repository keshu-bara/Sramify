import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function AddLayout() {
    return (
        <GestureHandlerRootView>
            <Stack>
                <Stack.Screen name="index" options={{
                    headerShown: false,
                }} />
                <Stack.Screen name="workers" options={{
                    headerShown: false,
                    animation: "slide_from_right"
                }} />
                <Stack.Screen name="register" options={{
                    headerShown: false,
                    animation: "slide_from_right"
                }} />
                <Stack.Screen name="dashboard" options={{
                    headerShown: false,
                    animation: "slide_from_right"
                }} />
                <Stack.Screen name="add" options={{
                    headerShown: false,
                    animation: "slide_from_right"
                }} />
                <Stack.Screen name="prpfile" options={{
                    headerShown: false,
                    animation: "slide_from_right"
                }} />
            </Stack>
        </GestureHandlerRootView>
    )
}