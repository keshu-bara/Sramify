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
                <Stack.Screen name="ask" options={{
                    headerShown: false,
                    animation: "slide_from_right"
                }} />
                <Stack.Screen name="added" options={{
                    headerShown: false,
                    animation: "slide_from_right"
                }} />
            </Stack>
        </GestureHandlerRootView>
    )
}