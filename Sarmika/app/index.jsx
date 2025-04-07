import React from "react";
import { Text, Pressable, View, Image, StatusBar, ImageBackground, useWindowDimensions, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

const Page = () => {
    // Get dynamic window dimensions
    const { width, height } = useWindowDimensions();
    const isSmallDevice = width < 375;
    const isMediumDevice = width >= 375 && width < 768;
    const isLargeDevice = width >= 768;
    
    // Dynamic sizing calculations - adjusted for better text fit
    const logoSize = isSmallDevice ? 80 : isMediumDevice ? 120 : 160;
    const buttonWidth = isSmallDevice ? 140 : isMediumDevice ? 160 : 200;  // Increased width
    const buttonHeight = isSmallDevice ? 140 : isMediumDevice ? 160 : 200; // Increased height
    const buttonMargin = isSmallDevice ? 5 : isMediumDevice ? 10 : 15;
    const iconSize = isSmallDevice ? 24 : isMediumDevice ? 30 : 40;
    const buttonTextSize = isSmallDevice ? 14 : isMediumDevice ? 16 : 20; // Adjusted text size
    
    return (
        <ImageBackground 
            source={require('../assets/Images/footerbg.png')} 
            style={{
                flex: 1,
                width: '100%',
            }}
            imageStyle={{
                resizeMode: 'cover',
                height: '100%',
                opacity: 0.9,
            }}
        >
            <View className="absolute inset-0 bg-white/95" />
            
            <SafeAreaView className="flex-1">
                <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={Platform.OS === 'android'} />

                {/* Logo section */}
                <View className="w-full items-center justify-center" 
                      style={{ 
                          paddingTop: isSmallDevice ? 30 : 40, 
                          paddingBottom: isSmallDevice ? 15 : 25
                      }}
                >
                    <Image 
                        source={require('../assets/Images/sramifyicon.png')} 
                        className="w-40 h-40" 
                        resizeMode="contain"
                    />
                    <Text className="text-3xl font-lbold mt-3 text-blue-800">Sramify</Text>
                    <Text className="text-sm text-gray-500 mt-1">Choose your portal</Text>
                    
                    {/* Add tagline */}
                    <Text className="text-blue-600 italic text-xl mt-2">
                        "Sramik ko nai disha, rozgar ke nai raah."
                    </Text>
                </View>

                {/* Gradient divider that blends with background */}
                <View className="w-full h-1 bg-gradient-to-r from-blue-100 via-blue-300 to-blue-100" />

                {/* Main content area */}
                <View className="flex-1 items-center justify-center px-4 py-6">
                    {/* App description - Enhanced with better visibility */}
                    <View className="bg-blue-50/50 px-4 py-3 rounded-lg mb-8 max-w-md">
                        <Text className="text-center">
                            <Text className="text-xl font-lbold text-blue-800">Welcome</Text>
                            <Text className="text-lg text-gray-700"> to the </Text>
                            <Text className="text-xl font-lbold text-blue-800">Sramify</Text>
                            <Text className="text-lg text-gray-700"> platform.</Text>
                        </Text>
                        <Text className="text-base text-gray-700 text-center mt-2">
                            Select your user type to continue.
                        </Text>
                    </View>

                    {/* Buttons container */}
                    <View className={`${width < 500 ? 'flex-col' : 'flex-row'} flex-wrap justify-center`}>
                        <Pressable 
                            onPress={() => router.push("/sramikarta")} 
                            className="bg-blue-500 rounded-2xl p-6 m-3 items-center justify-center shadow-lg"
                            style={{
                                width: buttonWidth,
                                height: buttonHeight,
                                borderWidth: 1,
                                borderColor: 'rgba(255,255,255,0.3)',
                            }}
                        >
                            <View className="items-center">
                                <FontAwesome5 name="user-shield" size={iconSize} color="white" />
                                <Text className="text-white font-lbold mt-3" style={{ fontSize: buttonTextSize }}>Sramikarta</Text>
                                <Text className="text-white text-xs mt-2 opacity-80">Admin Portal</Text>
                            </View>
                        </Pressable>
                        
                        <Pressable 
                            onPress={() => router.push("/sramika")} 
                            className="bg-green-500 rounded-2xl p-6 m-3 items-center justify-center shadow-md"
                            style={{
                                width: buttonWidth,
                                height: buttonHeight,
                            }}
                        >
                            <View className="items-center">
                                <FontAwesome5 name="user" size={iconSize} color="white" />
                                <Text className="text-white font-lbold mt-3" style={{ fontSize: buttonTextSize }}>Sramify</Text>
                                <Text className="text-white text-xs mt-2 opacity-80">User Portal</Text>
                            </View>
                        </Pressable>
                    </View>
                </View>

                {/* Footer with properly sized background */}
                <View className="w-full overflow-hidden">
                    <View className="absolute inset-0 bg-black/30 items-center justify-center">
                        <Text className="text-white text-xs">© 2025 Sramify App</Text>
                        <Text className="text-white/70 text-xs mt-1">All Rights Reserved</Text>
                    </View>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
};

export default Page;