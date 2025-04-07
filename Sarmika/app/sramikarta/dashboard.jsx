import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import LabourDB from "../../libs/database";

const { width } = Dimensions.get("window");

const ContractorDashboardPage = () => {
  const [labours, setLabours] = useState([]);
  const [expandedProfile, setExpandedProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerHeight = useRef(new Animated.Value(120)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const scaleAnimMap = {};
  const fadeAnimMap = {};

  useEffect(() => {
    // Animate fade-in of the whole screen
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    fetchLabours();
  }, []);

  const fetchLabours = async () => {
    setLoading(true);
    try {
      const profiles = await LabourDB.getAllLabourProfiles();
      const transformedProfiles = profiles.map((profile) => ({
        id: profile.id.toString(),
        name: profile.full_name,
        age: profile.age,
        rating: calculateRating(profile),
        experience: profile.experience,
        skills: profile.skills,
        hourlyRate: profile.hourly_rate,
        availability: profile.availability,
        completedJobs: profile.completed_jobs,
        location: profile.location,
        languages: profile.languages.split(",").map((lang) => lang.trim()),
        photo: profile.photo || "https://via.placeholder.com/64",
        verified: profile.verified,
        contactNumber: profile.phone,
      }));

      // Create animation references for each item
      transformedProfiles.forEach((profile) => {
        scaleAnimMap[profile.id] = new Animated.Value(1);
        fadeAnimMap[profile.id] = new Animated.Value(0);
      });

      setLabours(transformedProfiles);

      // Staggered animation of items appearing
      transformedProfiles.forEach((profile, index) => {
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.timing(fadeAnimMap[profile.id], {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } catch (error) {
      console.error("Error fetching labour profiles:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLabours();
  };

  const calculateRating = (profile) => {
    const baseRating = 3.0;
    const experienceBonus = Math.min(profile.experience * 0.1, 1.0);
    const jobsBonus = Math.min(profile.completed_jobs * 0.05, 1.0);
    const rating = baseRating + experienceBonus + jobsBonus;
    return rating.toFixed(1);
  };

  const toggleExpandProfile = (id) => {
    // Animate the card scale
    Animated.sequence([
      Animated.timing(scaleAnimMap[id], {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimMap[id], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setExpandedProfile(expandedProfile === id ? null : id);
  };

  const handleAddLabour = () => {
    router.push("/sramikarta/add");
  };

  const handleProfile = () => {
    router.push("/sramikarta/profile");
  };

  // Status indicators with colors
  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case "Immediate":
        return { bg: "#DCFCE7", text: "#16A34A" };
      case "Within 2 days":
        return { bg: "#FEF9C3", text: "#CA8A04" };
      case "Within a week":
        return { bg: "#E0F2FE", text: "#0284C7" };
      default:
        return { bg: "#F3F4F6", text: "#6B7280" };
    }
  };

  const renderHeader = () => {
    // Animated header that changes as you scroll
    const headerOpacity = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [1, 0.98],
      extrapolate: "clamp",
    });

    const headerScale = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [1, 0.98],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={{
          opacity: headerOpacity,
          transform: [{ scale: headerScale }],
        }}
      >
        <LinearGradient
          colors={["#1E40AF", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="pt-2 pb-6 px-4"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity
                className="mr-2 p-1"
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-2xl font-lbold text-white">
                My Dashboard
              </Text>
            </View>
            <TouchableOpacity
              className="bg-white/20 p-2 rounded-full"
              onPress={handleProfile}
            >
              <Ionicons name="person" size={22} color="white" />
            </TouchableOpacity>
          </View>

          {/* Quick stats */}
          <View className="flex-row mt-5 justify-between">
            <View className="bg-white/20 py-3 px-4 rounded-xl flex-1 mr-2">
              <Text className="text-white/80 text-xs font-lmedium">
                Total Workers
              </Text>
              <View className="flex-row items-center">
                <Text className="text-white text-xl font-lbold mr-1">
                  {labours.length}
                </Text>
                <MaterialCommunityIcons
                  name="account-group"
                  size={16}
                  color="white"
                />
              </View>
            </View>

            <View className="bg-white/20 py-3 px-4 rounded-xl flex-1 mx-1">
              <Text className="text-white/80 text-xs font-lmedium">
                Available Now
              </Text>
              <View className="flex-row items-center">
                <Text className="text-white text-xl font-lbold mr-1">
                  {labours.filter((l) => l.availability === "Immediate").length}
                </Text>
                <Ionicons name="checkmark-circle" size={16} color="#4ADE80" />
              </View>
            </View>

            <View className="bg-white/20 py-3 px-4 rounded-xl flex-1 ml-2">
              <Text className="text-white/80 text-xs font-lmedium">
                Verified
              </Text>
              <View className="flex-row items-center">
                <Text className="text-white text-xl font-lbold mr-1">
                  {labours.filter((l) => l.verified).length}
                </Text>
                <Ionicons name="shield-checkmark" size={16} color="#2DD4BF" />
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderEmptyList = () => {
    if (loading)
      return (
        <View className="flex-1 justify-center items-center mt-10">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-500 text-lg font-lmedium">
            Loading workers...
          </Text>
        </View>
      );

    return (
      <View className="flex-1 justify-center items-center mt-20 px-6">
        <MaterialCommunityIcons
          name="account-group"
          size={64}
          color="#CBD5E1"
        />
        <Text className="mt-4 text-gray-700 text-xl font-lbold text-center">
          No Workers Yet
        </Text>
        <Text className="mt-2 text-gray-500 text-base text-center font-lregular">
          Add your first labour profile to start managing your workforce
        </Text>
        <TouchableOpacity className="mt-6" onPress={handleAddLabour}>
          <LinearGradient
            colors={["#22C55E", "#16A34A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="py-3 px-6 rounded-xl flex-row items-center"
          >
            <Ionicons name="add-circle" size={20} color="white" />
            <Text className="text-white font-lbold ml-2">Add Worker</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item, index }) => {
    const availStyle = getAvailabilityColor(item.availability);

    return (
      <Animated.View
        style={{
          opacity: fadeAnimMap[item.id] || fadeAnim,
          transform: [
            { scale: scaleAnimMap[item.id] || new Animated.Value(1) },
          ],
        }}
      >
        <TouchableOpacity
          className="bg-white rounded-xl mb-4 overflow-hidden"
          onPress={() => toggleExpandProfile(item.id)}
          style={{
            elevation: 3,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          }}
          activeOpacity={0.9}
        >
          {/* Basic Info Card */}
          <View className="p-4">
            <View className="flex-row">
              {/* Profile Photo with verified badge */}
              <View className="mr-3 relative">
                {item.photo ? (
                  <Image
                    source={{ uri: item.photo }}
                    className="w-16 h-16 rounded-full border-2 border-gray-100"
                    style={{ width: 64, height: 64, borderRadius: 32 }}
                  />
                ) : (
                  <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center">
                    <Text className="text-blue-500 font-lbold text-xl">
                      {item.name.charAt(0)}
                    </Text>
                  </View>
                )}
                {item.verified && (
                  <View className="absolute -bottom-1 -right-1 bg-teal-500 rounded-full p-1 border-2 border-white">
                    <Ionicons name="shield-checkmark" size={12} color="white" />
                  </View>
                )}
              </View>

              {/* Profile Info */}
              <View className="flex-1">
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg font-lbold text-gray-800">
                    {item.name}
                    <Text className="text-gray-400 font-lregular text-sm">
                      {" "}
                      • {item.age} yrs
                    </Text>
                  </Text>
                  <View className="flex-row items-center bg-yellow-100 px-2 py-1 rounded-md">
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text className="text-yellow-700 ml-1 font-lbold">
                      {item.rating}
                    </Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap mt-1">
                  {item.skills.slice(0, 3).map((skill, index) => (
                    <View
                      key={`${item.id}-${skill}`}
                      className="bg-blue-50 rounded-md px-2 py-1 mr-2 mb-1"
                    >
                      <Text className="text-blue-700 text-xs font-lmedium">
                        {skill}
                      </Text>
                    </View>
                  ))}
                  {item.skills.length > 3 && (
                    <View className="bg-gray-100 rounded-md px-2 py-1 mr-2 mb-1">
                      <Text className="text-gray-600 text-xs font-lmedium">
                        +{item.skills.length - 3} more
                      </Text>
                    </View>
                  )}
                </View>

                <View className="flex-row items-center mt-1">
                  <Ionicons name="location-outline" size={14} color="#6B7280" />
                  <Text className="text-gray-500 text-xs ml-1 font-lregular">
                    {item.location}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100">
              <View className="items-center">
                <Text className="text-gray-500 text-xs font-lmedium">
                  Experience
                </Text>
                <Text className="text-gray-800 font-lbold">
                  {item.experience} years
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-gray-500 text-xs font-lmedium">
                  Hourly Rate
                </Text>
                <Text className="text-gray-800 font-lbold">
                  ₹{item.hourlyRate}
                </Text>
              </View>
              <View className="items-center">
                <View
                  className="px-2 py-1 rounded-full"
                  style={{ backgroundColor: availStyle.bg }}
                >
                  <Text
                    className="text-xs font-lbold"
                    style={{ color: availStyle.text }}
                  >
                    {item.availability}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Expanded Details */}
          {expandedProfile === item.id && (
            <Animated.View
              className="bg-gray-50 p-4 border-t border-gray-200"
              entering={Animated.FadeIn.duration(300)}
              exiting={Animated.FadeOut.duration(200)}
            >
              <View className="mb-4">
                <Text className="text-gray-900 font-lbold mb-2">
                  Contact Information
                </Text>
                <View className="bg-white p-3 rounded-lg flex-row items-center">
                  <View className="bg-blue-100 p-2 rounded-full mr-3">
                    <Ionicons name="call-outline" size={18} color="#3B82F6" />
                  </View>
                  <View>
                    <Text className="text-gray-900 font-lmedium">
                      {item.contactNumber}
                    </Text>
                    <Text className="text-gray-500 text-xs font-lregular">
                      Primary Contact
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="ml-auto bg-green-500 p-2 rounded-full"
                    onPress={() => {
                      // Handle call action
                      Linking.openURL(`tel:${item.contactNumber}`);
                    }}
                  >
                    <Ionicons name="call" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-gray-900 font-lbold mb-2">
                  Work History
                </Text>
                <View className="bg-white p-3 rounded-lg flex-row items-center">
                  <View className="bg-amber-100 p-2 rounded-full mr-3">
                    <FontAwesome5 name="briefcase" size={16} color="#F59E0B" />
                  </View>
                  <View>
                    <Text className="text-gray-900 font-lmedium">
                      {item.completedJobs} jobs completed
                    </Text>
                    <Text className="text-gray-500 text-xs font-lregular">
                      {item.experience} years experience
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mb-3">
                <Text className="text-gray-900 font-lbold mb-2">Languages</Text>
                <View className="flex-row flex-wrap">
                  {item.languages.map((lang) => (
                    <View
                      key={lang}
                      className="bg-white px-3 py-2 rounded-lg mr-2 mb-2 border border-gray-100"
                    >
                      <Text className="text-gray-700 font-lmedium">{lang}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className="mt-2 flex-row">
                <TouchableOpacity
                  className="flex-1 bg-blue-50 py-2 mr-2 rounded-lg items-center flex-row justify-center"
                  onPress={() => {
                    // Handle message action
                  }}
                >
                  <Ionicons name="chatbox-outline" size={16} color="#3B82F6" />
                  <Text className="text-blue-600 ml-2 font-lbold">Message</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-green-50 py-2 ml-2 rounded-lg items-center flex-row justify-center"
                  onPress={() => {
                    // Handle hire action
                  }}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={16}
                    color="#22C55E"
                  />
                  <Text className="text-green-600 ml-2 font-lbold">Hire</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* Expand/Collapse Indicator */}
          <View
            className={`items-center py-2 ${
              expandedProfile === item.id ? "bg-gray-50" : "bg-white"
            }`}
          >
            <Ionicons
              name={expandedProfile === item.id ? "chevron-up" : "chevron-down"}
              size={16}
              color="#94A3B8"
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />

      <Animated.View
        style={{
          opacity: fadeAnim,
          flex: 1,
        }}
      >
        {renderHeader()}

        <Animated.FlatList
          data={labours}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 100, // Extra padding for FAB
            flexGrow: 1, // Ensures the empty state centers properly
          }}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#3B82F6"]}
              tintColor="#3B82F6"
            />
          }
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        />

        {/* Floating Action Button */}
        <View className="absolute bottom-6 right-6">
          <TouchableOpacity
            onPress={handleAddLabour}
            style={{
              elevation: 5,
              shadowColor: "#22C55E",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
            }}
          >
            <LinearGradient
              colors={["#22C55E", "#16A34A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-16 h-16 rounded-full items-center justify-center"
            >
              <Ionicons name="person-add" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default ContractorDashboardPage;
