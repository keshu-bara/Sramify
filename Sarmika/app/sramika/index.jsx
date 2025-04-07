import React, { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  Pressable,
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  StatusBar,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  FontAwesome5,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";

// Simplified work types with clearer categories
const workTypes = [
  {
    id: "1",
    name: "Construction",
    icon: "building",
    iconType: "fa5",
    color: "#F43F5E",
    bgColor: "#FFF1F2",
  },
  {
    id: "2",
    name: "Painting",
    icon: "palette",
    iconType: "ion",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
  },
  {
    id: "3",
    name: "Plumbing",
    icon: "water",
    iconType: "ion",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
  },
  {
    id: "4",
    name: "Electrical",
    icon: "flash",
    iconType: "ion",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
  },
  {
    id: "5",
    name: "Cleaning",
    icon: "spray-bottle",
    iconType: "mci",
    color: "#10B981",
    bgColor: "#ECFDF5",
  },
  {
    id: "6",
    name: "Gardening",
    icon: "leaf",
    iconType: "fa5",
    color: "#65A30D",
    bgColor: "#F7FEE7",
  },
  {
    id: "7",
    name: "Carpentry",
    icon: "hammer",
    iconType: "ion",
    color: "#B45309",
    bgColor: "#FEF3C7",
  },
  {
    id: "8",
    name: "Moving",
    icon: "truck",
    iconType: "fa5",
    color: "#6366F1",
    bgColor: "#EEF2FF",
  },
];

// Render the appropriate icon based on type
const renderIcon = (iconName, iconType, size, color) => {
  switch (iconType) {
    case "ion":
      return <Ionicons name={iconName} size={size} color={color} />;
    case "fa5":
      return <FontAwesome5 name={iconName} size={size} color={color} />;
    case "mci":
      return (
        <MaterialCommunityIcons name={iconName} size={size} color={color} />
      );
    default:
      return <MaterialIcons name={iconName} size={size} color={color} />;
  }
};

// For the floating animation effect - keeping just this one animation
const FloatingAnimation = ({ delay = 0, style, children }) => {
  const animation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 2000,
          delay: delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <Animated.View style={[style, { transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
};

const Page = () => {
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 380;
  const isMediumDevice = width >= 380 && width < 768;
  const isLargeDevice = width >= 768;

  const [searchQuery, setSearchQuery] = useState("");
  const [personsNeeded, setPersonsNeeded] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedWorkTypes, setSelectedWorkTypes] = useState([]);

  // Dynamic sizes based on screen dimensions
  const fontSize = {
    header: isSmallDevice ? 28 : isMediumDevice ? 32 : 36,
    subheader: isSmallDevice ? 16 : isMediumDevice ? 18 : 20,
    normal: isSmallDevice ? 14 : isMediumDevice ? 16 : 18,
    small: isSmallDevice ? 12 : isMediumDevice ? 14 : 16,
  };

  const padding = {
    container: isSmallDevice ? 16 : isMediumDevice ? 20 : 24,
    element: isSmallDevice ? 12 : isMediumDevice ? 16 : 20,
  };

  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = workTypes.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSelectWorkType = (workType) => {
    if (!selectedWorkTypes.some((item) => item.id === workType.id)) {
      setSelectedWorkTypes([...selectedWorkTypes, workType]);
    }
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const removeWorkType = (id) => {
    setSelectedWorkTypes(selectedWorkTypes.filter((item) => item.id !== id));
  };

  const handleSearch = () => {
    if (selectedWorkTypes.length === 0) return;

    // Extract just the skill names for passing to the workers page
    const skillNames = selectedWorkTypes.map((type) => type.name);

    // Parse persons needed to a number, default to 1 if not specified
    const workers = personsNeeded ? parseInt(personsNeeded, 10) : 1;

    // Pass the search parameters to the workers page using router.push
    router.push({
      pathname: "/sramika/workers",
      params: {
        skills: JSON.stringify(skillNames),
        personsNeeded: workers,
      },
    });
  };

  // Handle submission from keyboard
  const handleSubmitEditing = () => {
    if (searchQuery.length > 0 && suggestions.length > 0) {
      // If there's search text and suggestions, select the first suggestion
      handleSelectWorkType(suggestions[0]);
    } else if (selectedWorkTypes.length > 0) {
      // If there's no search text but we have selected work types, perform search
      handleSearch();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Simplified Header */}
          <LinearGradient
            colors={["#1E40AF", "#3B82F6", "#60A5FA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingTop: StatusBar.currentHeight + padding.container || 60,
              paddingBottom: 40,
              paddingHorizontal: padding.container,
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
            }}
          >
            {/* Back button */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="absolute top-8 left-4 bg-white/20 p-2 rounded-full z-10"
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>

            {/* Logo and App Name - Centered with animation preserved */}
            <View className="items-center mb-4">
              <FloatingAnimation delay={300}>
                <MotiView
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "timing", duration: 700 }}
                >
                  <Image
                    source={require("../../assets/Images/sramifyicon.png")}
                    style={{
                      width: isSmallDevice ? 70 : 80,
                      height: isSmallDevice ? 70 : 80,
                      marginBottom: 12,
                    }}
                    resizeMode="contain"
                  />
                </MotiView>
              </FloatingAnimation>

              <Text
                className="font-lbold text-white text-center"
                style={{ fontSize: fontSize.header }}
              >
                Sramify
              </Text>
              <Text
                className="text-white/90 font-lregular text-center"
                style={{ fontSize: fontSize.small }}
              >
                Instant Workforce • 30 Minutes
              </Text>
            </View>

            {/* Main Search Card */}
            <View className="bg-white rounded-xl p-4 shadow-lg mb-4">
              {/* Search Skills Input */}
              <View className="mb-3">
                <View className="flex-row items-center border border-gray-100 bg-gray-50 rounded-xl px-3 py-3">
                  <FontAwesome5
                    name="search"
                    size={16}
                    color="#3B82F6"
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    className="flex-1 font-lregular"
                    style={{ fontSize: fontSize.normal }}
                    placeholder="What type of worker do you need?"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onFocus={() =>
                      searchQuery.length > 0 && setShowSuggestions(true)
                    }
                    onSubmitEditing={handleSubmitEditing}
                    returnKeyType="search"
                    blurOnSubmit={false}
                  />

                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        if (suggestions.length > 0) {
                          handleSelectWorkType(suggestions[0]);
                        }
                      }}
                      className="ml-2 bg-blue-100 rounded-full p-1.5"
                    >
                      <Ionicons name="enter" size={16} color="#3B82F6" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Selected Work Types */}
              {selectedWorkTypes.length > 0 && (
                <View className="flex-row flex-wrap mb-3">
                  {selectedWorkTypes.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => removeWorkType(item.id)}
                      className="flex-row items-center rounded-full px-3 py-1.5 mr-2 mb-2"
                      style={{ backgroundColor: item.bgColor }}
                    >
                      {renderIcon(item.icon, item.iconType, 14, item.color)}
                      <Text
                        className="ml-1 mr-1 font-lmedium"
                        style={{ color: item.color, fontSize: fontSize.small }}
                      >
                        {item.name}
                      </Text>
                      <Ionicons
                        name="close-circle"
                        size={14}
                        color={item.color}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Number of Workers Input */}
              <View className="flex-row items-center border border-gray-100 bg-gray-50 rounded-xl px-3 py-3 mb-3">
                <FontAwesome5
                  name="users"
                  size={16}
                  color="#3B82F6"
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  className="flex-1 font-lregular"
                  style={{ fontSize: fontSize.normal }}
                  placeholder="Number of workers needed"
                  value={personsNeeded}
                  onChangeText={setPersonsNeeded}
                  keyboardType="numeric"
                  returnKeyType="search"
                  onSubmitEditing={
                    selectedWorkTypes.length > 0 ? handleSearch : null
                  }
                />
              </View>

              {/* Find Workers Button - More visible now */}
              <Pressable
                style={({ pressed }) => [
                  {
                    backgroundColor:
                      selectedWorkTypes.length === 0
                        ? "#D1D5DB" // Gray for disabled state
                        : pressed
                        ? "#1D4ED8" // Darker blue when pressed
                        : "#3B82F6", // Normal blue
                    borderRadius: 12,
                    paddingVertical: 16, // Slightly taller for better visibility
                    borderWidth: 1,
                    borderColor:
                      selectedWorkTypes.length === 0
                        ? "#9CA3AF" // Border for disabled state
                        : "#1D4ED8", // Darker border for enabled state
                    elevation: selectedWorkTypes.length === 0 ? 1 : 4, // More elevation when active
                  },
                ]}
                className="items-center justify-center"
                onPress={handleSearch}
                disabled={selectedWorkTypes.length === 0}
              >
                <View className="flex-row items-center justify-center">
                  {/* Lightning bolt icon with bright color and mild glow effect */}
                  <View
                    style={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      borderRadius: 100,
                      padding: 4,
                      marginRight: 8,
                    }}
                  >
                    <FontAwesome5
                      name="bolt"
                      size={16}
                      color={
                        selectedWorkTypes.length === 0 ? "#9CA3AF" : "#FFFFFF"
                      }
                    />
                  </View>
                  <Text
                    className="text-white font-lbold"
                    style={{
                      fontSize: fontSize.normal,
                      color:
                        selectedWorkTypes.length === 0 ? "#9CA3AF" : "#9CA3AF",
                      textShadowColor: "rgba(0,0,0,0.1)",
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 1,
                    }}
                  >
                    Find Workers Now
                  </Text>
                </View>
              </Pressable>
            </View>
          </LinearGradient>

          {/* Main Content Area */}
          <View style={{ padding: padding.container }}>
            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <View className="bg-white rounded-xl shadow-md mb-4 border border-gray-100 overflow-hidden">
                <View className="bg-blue-50 py-2 px-4 border-b border-blue-100">
                  <Text className="text-blue-700 font-lmedium">
                    Suggestions
                  </Text>
                </View>
                <FlatList
                  data={suggestions}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className="p-3 border-b border-gray-100 flex-row items-center"
                      style={({ pressed }) => [
                        {
                          backgroundColor: pressed ? item.bgColor : "white",
                        },
                      ]}
                      onPress={() => handleSelectWorkType(item)}
                    >
                      <View
                        style={{
                          backgroundColor: item.bgColor,
                          padding: 8,
                          borderRadius: 20,
                        }}
                      >
                        {renderIcon(item.icon, item.iconType, 16, item.color)}
                      </View>
                      <Text
                        className="text-gray-700 ml-3 font-lmedium"
                        style={{ fontSize: fontSize.normal }}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                  style={{ maxHeight: 200 }}
                />
              </View>
            )}

            {/* Popular Categories - No animations */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text
                  className="font-lbold text-gray-800"
                  style={{ fontSize: fontSize.normal }}
                >
                  Quick Select
                </Text>
              </View>

              {/* Work Type Grid - No animations */}
              <View className="flex-row flex-wrap" style={{ gap: 10 }}>
                {workTypes.slice(0, 6).map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleSelectWorkType(item)}
                    style={{
                      width: isLargeDevice ? "31%" : "48%",
                      marginBottom: 10,
                      backgroundColor: "white",
                      borderRadius: 12,
                      padding: padding.element,
                      flexDirection: "row",
                      alignItems: "center",
                      shadowColor: "#0F172A",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.07,
                      shadowRadius: 2,
                      elevation: 2,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: item.bgColor,
                        padding: 8,
                        borderRadius: 12,
                        marginRight: 10,
                      }}
                    >
                      {renderIcon(
                        item.icon,
                        item.iconType,
                        isSmallDevice ? 18 : 20,
                        item.color
                      )}
                    </View>
                    <Text
                      className="font-lmedium text-gray-700 flex-1"
                      style={{ fontSize: fontSize.small }}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Why Sramify - No animations */}
            <View className="mb-6">
              <View className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <Text
                  className="font-lbold text-gray-800 mb-3"
                  style={{ fontSize: fontSize.normal }}
                >
                  Why Sramify?
                </Text>

                <View className="mb-2 flex-row items-center">
                  <View className="bg-blue-100 rounded-full p-1.5 mr-2">
                    <FontAwesome5 name="bolt" size={12} color="#3B82F6" />
                  </View>
                  <Text
                    className="text-gray-700 font-lmedium"
                    style={{ fontSize: fontSize.small }}
                  >
                    Workers arrive in 30 minutes
                  </Text>
                </View>

                <View className="mb-2 flex-row items-center">
                  <View className="bg-blue-100 rounded-full p-1.5 mr-2">
                    <FontAwesome5 name="shield-alt" size={12} color="#3B82F6" />
                  </View>
                  <Text
                    className="text-gray-700 font-lmedium"
                    style={{ fontSize: fontSize.small }}
                  >
                    All workers verified & skilled
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <View className="bg-blue-100 rounded-full p-1.5 mr-2">
                    <FontAwesome5 name="star" size={12} color="#3B82F6" />
                  </View>
                  <Text
                    className="text-gray-700 font-lmedium"
                    style={{ fontSize: fontSize.small }}
                  >
                    Rated for quality & reliability
                  </Text>
                </View>
              </View>
            </View>

            {/* Bottom Actions - No animations */}
            <View className="mb-6">
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 bg-white rounded-xl p-3 flex-row items-center justify-center"
                  style={{
                    shadowColor: "#0F172A",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.07,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                  onPress={() => router.push("/sramikarta")}
                >
                  <MaterialIcons name="post-add" size={18} color="#3B82F6" />
                  <Text
                    className="ml-2 font-lsemibold text-gray-700"
                    style={{ fontSize: fontSize.small }}
                  >
                    Post a Job
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-white rounded-xl p-3 flex-row items-center justify-center"
                  style={{
                    shadowColor: "#0F172A",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.07,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                >
                  <MaterialIcons
                    name="support-agent"
                    size={18}
                    color="#3B82F6"
                  />
                  <Text
                    className="ml-2 font-lsemibold text-gray-700"
                    style={{ fontSize: fontSize.small }}
                  >
                    Get Help
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Simple Footer */}
            <View className="items-center mt-6 mb-4">
              <Text className="text-gray-500 text-xs font-lregular">
                Sramify • Instant Workforce Solutions
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Page;
