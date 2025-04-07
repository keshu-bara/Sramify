import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
  Animated,
  Linking,
  Platform,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import LabourDB from "../../libs/database";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

const SearchResultsPage = () => {
  // Get screen dimensions for responsive design
  const { width, height } = useWindowDimensions();
  const isSmallDevice = width < 380;
  const isMediumDevice = width >= 380 && width < 768;
  const isLargeDevice = width >= 768;

  // Dynamic font sizes based on device size
  const fontSize = {
    header: isSmallDevice ? 22 : isMediumDevice ? 24 : 28,
    subheader: isSmallDevice ? 16 : isMediumDevice ? 18 : 20,
    normal: isSmallDevice ? 14 : isMediumDevice ? 15 : 16,
    small: isSmallDevice ? 12 : isMediumDevice ? 13 : 14,
    tiny: isSmallDevice ? 10 : isMediumDevice ? 11 : 12,
  };

  // Get search parameters from URL params
  const params = useLocalSearchParams();
  const skills = params.skills ? JSON.parse(params.skills) : [];
  const personsNeeded = params.personsNeeded
    ? parseInt(params.personsNeeded, 10)
    : 1;
  const searchParams = {
    skills: skills,
    personsNeeded: personsNeeded,
  };

  // State variables
  const [selectedFilters, setSelectedFilters] = useState(["Highest Rated"]);
  const [expandedProfile, setExpandedProfile] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);

  // Modal states
  const [hireModalVisible, setHireModalVisible] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [hireDate, setHireDate] = useState(new Date());
  const [hireDuration, setHireDuration] = useState(1); // in days

  // Animations
  const cardScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalSlideAnim = useRef(new Animated.Value(height)).current;

  // Fetch workers from database based on skills
  const fetchWorkers = async () => {
    try {
      console.log("Fetching workers with skills:", searchParams.skills);
      let profiles;

      if (searchParams.skills && searchParams.skills.length > 0) {
        // Use skill-based search if skills are specified
        profiles = await LabourDB.getLabourProfilesBySkills(
          searchParams.skills
        );
      } else {
        // Otherwise get all profiles
        profiles = await LabourDB.getAllLabourProfiles();
      }

      // Transform the data to match the expected format in the UI
      const transformedProfiles = profiles.map((profile) => ({
        id: profile.id.toString(),
        name: profile.full_name,
        photo: profile.photo || "https://via.placeholder.com/64",
        verified: profile.verified,
        rating: calculateRating(profile),
        skills: profile.skills || [],
        location: profile.location || "Local Area",
        experience: profile.experience || 0,
        hourlyRate: profile.hourly_rate || 150,
        availability: profile.availability || "Immediate",
        completedJobs: profile.completed_jobs || 0,
        contactNumber: profile.phone || "+91 98765 43210",
        languages: profile.languages
          ? profile.languages.split(",").map((lang) => lang.trim())
          : ["Hindi", "English"],
        description:
          profile.description ||
          "Professional worker with experience in various projects.",
        jobSuccessRate: Math.floor(Math.random() * 20 + 80), // 80-100%
        punctualityScore: Math.floor(Math.random() * 20 + 80), // 80-100%
      }));

      setWorkers(transformedProfiles);
      fadeIn();
    } catch (err) {
      console.error("Error fetching labour profiles:", err);
      setError("Failed to load workers. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Animation functions
  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const scaleCard = (id) => {
    if (expandedProfile === id) {
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.sequence([
        Animated.timing(cardScale, {
          toValue: 0.97,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [searchParams.skills]);

  // Apply filters and search whenever workers or selectedFilters change
  useEffect(() => {
    let filtered = [...workers];

    // Apply search query if exists
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (worker) =>
          worker.name.toLowerCase().includes(query) ||
          worker.skills.some((skill) => skill.toLowerCase().includes(query)) ||
          worker.location.toLowerCase().includes(query)
      );
    }

    // Apply filters
    filtered = applyFilters(filtered, selectedFilters);
    setFilteredWorkers(filtered);
  }, [workers, selectedFilters, searchQuery]);

  // Calculate a rating score
  const calculateRating = (profile) => {
    const baseRating = 3.5;
    const experienceBonus = Math.min(profile.experience * 0.1, 1.0);
    const jobsBonus = Math.min((profile.completed_jobs || 0) * 0.05, 0.5);

    let rating = baseRating + experienceBonus + jobsBonus;
    // Ensure rating is between 3.0 and 5.0 for better UX
    rating = Math.max(3.0, Math.min(5.0, rating));
    return rating.toFixed(1);
  };

  // Apply sorting based on selected filters
  const applyFilters = (profiles, filters) => {
    let result = [...profiles];

    if (filters.includes("Highest Rated")) {
      result.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    }

    if (filters.includes("Most Experienced")) {
      result.sort((a, b) => b.experience - a.experience);
    }

    if (filters.includes("Lowest Price")) {
      result.sort((a, b) => a.hourlyRate - b.hourlyRate);
    }

    if (filters.includes("Immediate Availability")) {
      result = result.filter((worker) => worker.availability === "Immediate");
    }

    return result;
  };

  const toggleFilter = (filter) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== filter));
    } else {
      // If one of the sort filters is selected, remove all other sort filters
      if (
        filter === "Highest Rated" ||
        filter === "Lowest Price" ||
        filter === "Most Experienced"
      ) {
        const sortFilters = [
          "Highest Rated",
          "Lowest Price",
          "Most Experienced"
        ];
        
        // Remove any existing sort filters and add the new one
        const updatedFilters = selectedFilters.filter(
          (f) => !sortFilters.includes(f)
        );
        setSelectedFilters([...updatedFilters, filter]);
      } else {
        // For non-sort filters like "Immediate Availability", just add them
        setSelectedFilters([...selectedFilters, filter]);
      }
    }
  };

  const toggleExpandProfile = (id) => {
    scaleCard(id);
    if (expandedProfile === id) {
      setExpandedProfile(null);
    } else {
      setExpandedProfile(id);
    }
  };

  const handleHire = (worker) => {
    setSelectedWorker(worker);
    setHireModalVisible(true);

    // Animate modal sliding up
    Animated.spring(modalSlideAnim, {
      toValue: 0,
      tension: 50,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const closeHireModal = () => {
    // Animate modal sliding down
    Animated.timing(modalSlideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setHireModalVisible(false);
      setSelectedWorker(null);
    });
  };

  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleSMS = (phoneNumber) => {
    Linking.openURL(`sms:${phoneNumber}`);
  };

  const handleSaveProfile = (worker) => {
    // Animation feedback for saving
    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Here you would implement the actual save logic
    console.log("Saved profile:", worker.name);
  };

  const handleTryAgain = () => {
    setError(null);
    setLoading(true);
    fetchWorkers();
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkers();
  };

  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
    if (showSearchBar) {
      setSearchQuery("");
    }
  };

  // Render rating stars
  const renderRatingStars = (rating) => {
    const ratingNum = parseFloat(rating);
    const fullStars = Math.floor(ratingNum);
    const halfStar = ratingNum - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <View className="flex-row">
        {[...Array(fullStars)].map((_, i) => (
          <FontAwesome
            key={`full-${i}`}
            name="star"
            size={12}
            color="#F59E0B"
          />
        ))}
        {halfStar && (
          <FontAwesome
            key="half"
            name="star-half-o"
            size={12}
            color="#F59E0B"
          />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <FontAwesome
            key={`empty-${i}`}
            name="star-o"
            size={12}
            color="#F59E0B"
          />
        ))}
      </View>
    );
  };

  // Header component
  const renderHeader = () => (
    <>
      <LinearGradient
        colors={["#1E40AF", "#3B82F6", "#60A5FA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-2 pb-4 px-4"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity className="mr-3" onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text
              className="text-white font-lbold"
              style={{ fontSize: fontSize.header }}
            >
              Workers Available
            </Text>
          </View>
          <TouchableOpacity onPress={toggleSearchBar}>
            <Ionicons
              name={showSearchBar ? "close-outline" : "search-outline"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {showSearchBar ? (
          <View className="mt-3 bg-white/20 rounded-lg flex-row items-center px-3 py-2">
            <Ionicons name="search" size={18} color="white" />
            <TextInput
              className="flex-1 ml-2 text-white font-lregular"
              placeholder="Search by name or skill..."
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color="white" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View className="flex-row items-center mt-2 flex-wrap">
            {searchParams.skills.length > 0 ? (
              <>
                <View className="flex-row items-center">
                  <View className="bg-white/20 rounded-full p-1 mr-2">
                    <Ionicons name="briefcase" size={14} color="white" />
                  </View>
                  <Text
                    className="text-white font-lmedium"
                    style={{ fontSize: fontSize.small }}
                  >
                    {searchParams.skills.join(", ")}
                  </Text>
                </View>
                <View className="flex-row items-center ml-4">
                  <View className="bg-white/20 rounded-full p-1 mr-2">
                    <Ionicons name="people" size={14} color="white" />
                  </View>
                  <Text
                    className="text-white font-lmedium"
                    style={{ fontSize: fontSize.small }}
                  >
                    {searchParams.personsNeeded} worker
                    {searchParams.personsNeeded > 1 ? "s" : ""}
                  </Text>
                </View>
              </>
            ) : (
              <Text
                className="text-white font-lmedium"
                style={{ fontSize: fontSize.small }}
              >
                Showing all available workers
              </Text>
            )}
          </View>
        )}
      </LinearGradient>

      {/* Worker count and sort options */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-3">
          <Text
            className="text-gray-700 font-lmedium"
            style={{ fontSize: fontSize.normal }}
          >
            {filteredWorkers.length} workers found
          </Text>
          {filteredWorkers.length > 0 && (
            <View className="flex-row items-center">
              <MaterialIcons name="sort" size={18} color="#666" />
              <Text
                className="text-gray-700 ml-1 font-lregular"
                style={{ fontSize: fontSize.small }}
              >
                Sort by
              </Text>
            </View>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="pb-1"
        >
          {[
            { name: "Highest Rated", icon: "star" },
            { name: "Nearest", icon: "location" },
            { name: "Lowest Price", icon: "cash" },
            { name: "Most Experienced", icon: "briefcase" },
            { name: "Immediate Availability", icon: "time" },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.name}
              className={`px-3 py-1.5 mr-2 rounded-full border flex-row items-center ${
                selectedFilters.includes(filter.name)
                  ? "bg-blue-600 border-blue-700"
                  : "bg-white border-gray-200"
              }`}
              style={{
                shadowColor: selectedFilters.includes(filter.name)
                  ? "#1E40AF"
                  : "#111",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: selectedFilters.includes(filter.name)
                  ? 0.2
                  : 0.05,
                shadowRadius: 2,
                elevation: selectedFilters.includes(filter.name) ? 2 : 1,
              }}
              onPress={() => toggleFilter(filter.name)}
            >
              <Ionicons
                name={filter.icon}
                size={14}
                color={selectedFilters.includes(filter.name) ? "white" : "#666"}
              />
              <Text
                className={`${
                  selectedFilters.includes(filter.name)
                    ? "text-white"
                    : "text-gray-700"
                } ml-1 font-lmedium`}
                style={{ fontSize: fontSize.small }}
              >
                {filter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );

  // Render the hire modal
  const renderHireModal = () => {
    if (!selectedWorker) return null;

    const totalCost = selectedWorker.hourlyRate * 8 * hireDuration; // 8 hours per day

    return (
      <Modal
        visible={hireModalVisible}
        transparent={true}
        animationType="none" // We're handling our own animation
        onRequestClose={closeHireModal}
      >
        <View className="flex-1 justify-end bg-black/50">
          <Animated.View
            className="bg-white rounded-t-3xl pb-8"
            style={{ transform: [{ translateY: modalSlideAnim }] }}
          >
            <View className="items-center py-2">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            <View className="px-4">
              <View className="flex-row items-center mb-4 pb-4 border-b border-gray-200">
                <Image
                  source={{ uri: selectedWorker.photo }}
                  className="rounded-full"
                  style={{ width: 60, height: 60, borderRadius: 30 }}
                />
                <View className="ml-3 flex-1">
                  <Text
                    className="text-gray-800 font-lbold"
                    style={{ fontSize: fontSize.subheader }}
                  >
                    Hire {selectedWorker.name}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <FontAwesome name="star" size={12} color="#F59E0B" />
                    <Text
                      className="text-gray-600 ml-1 font-lregular"
                      style={{ fontSize: fontSize.small }}
                    >
                      {selectedWorker.rating} • {selectedWorker.experience} year
                      {selectedWorker.experience !== 1 ? "s" : ""} exp • ₹
                      {selectedWorker.hourlyRate}/hr
                    </Text>
                  </View>
                </View>
                <TouchableOpacity className="p-2" onPress={closeHireModal}>
                  <Ionicons name="close-circle" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-100">
                <Text
                  className="text-blue-800 font-lmedium mb-1"
                  style={{ fontSize: fontSize.small }}
                >
                  Job Details
                </Text>
                <View className="flex-row items-center mb-2">
                  <Ionicons
                    name="briefcase-outline"
                    size={16}
                    color="#1E40AF"
                  />
                  <Text
                    className="ml-2 text-gray-700 font-lregular"
                    style={{ fontSize: fontSize.small }}
                  >
                    {searchParams.skills.join(", ")}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="people-outline" size={16} color="#1E40AF" />
                  <Text
                    className="ml-2 text-gray-700 font-lregular"
                    style={{ fontSize: fontSize.small }}
                  >
                    {searchParams.personsNeeded} worker
                    {searchParams.personsNeeded > 1 ? "s" : ""}
                  </Text>
                </View>
              </View>

              <View className="bg-gray-50 p-3 rounded-lg mb-4">
                <Text
                  className="text-gray-800 font-lmedium mb-1"
                  style={{ fontSize: fontSize.small }}
                >
                  Hiring Duration
                </Text>
                <View className="flex-row justify-between items-center">
                  <TouchableOpacity
                    className="bg-white p-2 rounded-md border border-gray-200 w-10 h-10 items-center justify-center"
                    onPress={() =>
                      setHireDuration(Math.max(1, hireDuration - 1))
                    }
                  >
                    <Ionicons name="remove" size={20} color="#4B5563" />
                  </TouchableOpacity>
                  <Text
                    className="text-gray-800 font-lbold mx-4"
                    style={{ fontSize: fontSize.subheader }}
                  >
                    {hireDuration} Day{hireDuration > 1 ? "s" : ""}
                  </Text>
                  <TouchableOpacity
                    className="bg-white p-2 rounded-md border border-gray-200 w-10 h-10 items-center justify-center"
                    onPress={() => setHireDuration(hireDuration + 1)}
                  >
                    <Ionicons name="add" size={20} color="#4B5563" />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="bg-yellow-50 p-3 rounded-lg mb-6 border border-yellow-100">
                <View className="flex-row justify-between items-center">
                  <Text
                    className="text-gray-700 font-lmedium"
                    style={{ fontSize: fontSize.normal }}
                  >
                    Total Amount:
                  </Text>
                  <Text
                    className="text-gray-800 font-lbold"
                    style={{ fontSize: fontSize.subheader }}
                  >
                    ₹{totalCost}
                  </Text>
                </View>
                <Text
                  className="text-gray-500 font-lregular mt-1"
                  style={{ fontSize: fontSize.tiny }}
                >
                  (₹{selectedWorker.hourlyRate} × 8 hours × {hireDuration} days)
                </Text>
              </View>

              <View className="flex-row mb-4">
                <TouchableOpacity
                  className="flex-1 bg-blue-100 py-3 mr-2 rounded-xl flex-row items-center justify-center"
                  onPress={() => handleCall(selectedWorker.contactNumber)}
                >
                  <Ionicons name="call-outline" size={20} color="#1E40AF" />
                  <Text
                    className="text-blue-700 font-lbold ml-2"
                    style={{ fontSize: fontSize.small }}
                  >
                    Call
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-green-100 py-3 ml-2 rounded-xl flex-row items-center justify-center"
                  onPress={() => handleSMS(selectedWorker.contactNumber)}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={20}
                    color="#047857"
                  />
                  <Text
                    className="text-green-700 font-lbold ml-2"
                    style={{ fontSize: fontSize.small }}
                  >
                    Message
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                className="bg-blue-600 py-4 rounded-xl items-center"
                onPress={() => {
                  console.log(
                    `Hiring ${selectedWorker.name} for ${hireDuration} days at ₹${totalCost}`
                  );
                  // Implement actual hiring logic
                  closeHireModal();
                  // Navigate to confirmation/payment page
                }}
              >
                <Text
                  className="text-white font-lbold"
                  style={{ fontSize: fontSize.normal }}
                >
                  Confirm Hiring
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />

      {/* Fixed header */}
      {renderHeader()}

      {/* Loading and Error States */}
      {loading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-2 text-gray-600 font-lregular">
            Finding workers in your area...
          </Text>
        </View>
      )}

      {error && !loading && (
        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="mt-2 text-gray-800 text-center font-lbold">
            {error}
          </Text>
          <TouchableOpacity
            className="mt-4 bg-blue-600 px-4 py-2 rounded-full"
            onPress={handleTryAgain}
          >
            <Text className="text-white font-lbold">Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results */}
      {!loading && !error && (
        <Animated.FlatList
          data={filteredWorkers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          style={{ opacity: fadeAnim }}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center py-12 px-4">
              <Image
                source={{
                  uri: "https://img.icons8.com/color/96/000000/search-in-cloud.png",
                }}
                style={{ width: 80, height: 80, opacity: 0.7 }}
              />
              <Text className="mt-4 text-gray-600 text-center font-lmedium">
                No workers found matching your criteria.
              </Text>
              <Text className="mt-1 text-gray-500 text-center font-lregular">
                Try adjusting your filters or search terms.
              </Text>
              <TouchableOpacity
                className="mt-4 bg-blue-600 px-6 py-2 rounded-full"
                onPress={() => {
                  setSearchQuery("");
                  setSelectedFilters(["Highest Rated"]);
                }}
              >
                <Text className="text-white font-lmedium">Clear Filters</Text>
              </TouchableOpacity>
            </View>
          )}
          renderItem={({ item }) => (
            <Animated.View
              style={[
                {
                  transform: [
                    { scale: expandedProfile === item.id ? cardScale : 1 },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                className="bg-white rounded-xl mb-4 overflow-hidden"
                style={styles.cardShadow}
                onPress={() => toggleExpandProfile(item.id)}
                activeOpacity={0.9}
              >
                {/* Basic Info Card */}
                <View className="p-4">
                  <View className="flex-row">
                    {/* Profile Photo */}
                    <View className="mr-3">
                      <Image
                        source={{ uri: item.photo }}
                        className="rounded-full"
                        style={{ width: 68, height: 68, borderRadius: 34 }}
                      />
                      {item.verified && (
                        <View className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1.5 border-2 border-white">
                          <Ionicons name="checkmark" size={12} color="white" />
                        </View>
                      )}
                    </View>

                    {/* Profile Info */}
                    <View className="flex-1">
                      <View className="flex-row justify-between items-center">
                        <Text
                          className="text-gray-800 font-lbold"
                          style={{ fontSize: fontSize.subheader }}
                        >
                          {item.name}
                        </Text>
                        <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-md border border-yellow-200">
                          <Text
                            className="text-yellow-700 font-lbold mr-1"
                            style={{ fontSize: fontSize.normal }}
                          >
                            {item.rating}
                          </Text>
                          {renderRatingStars(item.rating)}
                        </View>
                      </View>

                      <View className="flex-row flex-wrap mt-1.5">
                        {item.skills.slice(0, 3).map((skill, index) => (
                          <View
                            key={index}
                            className="bg-blue-50 rounded-md px-2 py-1 mr-2 mb-1 border border-blue-100"
                          >
                            <Text
                              className="text-blue-700 font-lregular"
                              style={{ fontSize: fontSize.tiny }}
                            >
                              {skill}
                            </Text>
                          </View>
                        ))}
                        {item.skills.length > 3 && (
                          <View className="bg-gray-100 rounded-md px-2 py-1 mb-1 border border-gray-200">
                            <Text
                              className="text-gray-600 font-lregular"
                              style={{ fontSize: fontSize.tiny }}
                            >
                              +{item.skills.length - 3}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View className="flex-row items-center mt-1.5">
                        <Ionicons name="location" size={14} color="#6366F1" />
                        <Text
                          className="text-gray-600 ml-1 font-lregular"
                          style={{ fontSize: fontSize.small }}
                        >
                          {item.location}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100">
                    <View className="items-center">
                      <Text
                        className="text-gray-500 font-lregular"
                        style={{ fontSize: fontSize.tiny }}
                      >
                        Experience
                      </Text>
                      <Text
                        className="text-gray-800 font-lbold"
                        style={{ fontSize: fontSize.normal }}
                      >
                        {item.experience} year{item.experience !== 1 ? "s" : ""}
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text
                        className="text-gray-500 font-lregular"
                        style={{ fontSize: fontSize.tiny }}
                      >
                        Hourly Rate
                      </Text>
                      <Text
                        className="text-gray-800 font-lbold"
                        style={{ fontSize: fontSize.normal }}
                      >
                        ₹{item.hourlyRate}
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text
                        className="text-gray-500 font-lregular"
                        style={{ fontSize: fontSize.tiny }}
                      >
                        Availability
                      </Text>
                      <Text
                        className={`font-lbold ${
                          item.availability === "Immediate"
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                        style={{ fontSize: fontSize.normal }}
                      >
                        {item.availability}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Expanded Details */}
                {expandedProfile === item.id && (
                  <View className="bg-gray-50 p-4 border-t border-gray-200">
                    {/* Description */}
                    <View className="mb-4">
                      <Text
                        className="text-gray-800 font-lregular"
                        style={{ fontSize: fontSize.small }}
                      >
                        {item.description}
                      </Text>
                    </View>

                    {/* Performance and skills */}
                    <View className="flex-row mb-4">
                      <View className="flex-1 bg-white rounded-lg p-3 mr-2 border border-gray-200">
                        <Text
                          className="text-gray-500 font-lregular mb-1"
                          style={{ fontSize: fontSize.tiny }}
                        >
                          Job Success
                        </Text>
                        <View className="flex-row items-center">
                          <Text
                            className="text-gray-800 font-lbold mr-2"
                            style={{ fontSize: fontSize.normal }}
                          >
                            {item.jobSuccessRate}%
                          </Text>
                          <View className="flex-1 h-2 bg-gray-200 rounded">
                            <View
                              className="h-2 bg-blue-500 rounded"
                              style={{ width: `${item.jobSuccessRate}%` }}
                            />
                          </View>
                        </View>
                      </View>
                      <View className="flex-1 bg-white rounded-lg p-3 ml-2 border border-gray-200">
                        <Text
                          className="text-gray-500 font-lregular mb-1"
                          style={{ fontSize: fontSize.tiny }}
                        >
                          Punctuality
                        </Text>
                        <View className="flex-row items-center">
                          <Text
                            className="text-gray-800 font-lbold mr-2"
                            style={{ fontSize: fontSize.normal }}
                          >
                            {item.punctualityScore}%
                          </Text>
                          <View className="flex-1 h-2 bg-gray-200 rounded">
                            <View
                              className="h-2 bg-green-500 rounded"
                              style={{ width: `${item.punctualityScore}%` }}
                            />
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Job stats and contact */}
                    <View className="flex-row justify-between mb-4">
                      <View className="flex-row items-center bg-blue-50 rounded-md p-2 flex-1 mr-1">
                        <View className="bg-blue-100 p-1 rounded-md">
                          <Ionicons
                            name="briefcase"
                            size={16}
                            color="#3B82F6"
                          />
                        </View>
                        <View className="ml-2">
                          <Text
                            className="text-gray-500 font-lregular"
                            style={{ fontSize: fontSize.tiny }}
                          >
                            Jobs Completed
                          </Text>
                          <Text
                            className="text-gray-800 font-lbold"
                            style={{ fontSize: fontSize.small }}
                          >
                            {item.completedJobs}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center bg-green-50 rounded-md p-2 flex-1 ml-1">
                        <View className="bg-green-100 p-1 rounded-md">
                          <Ionicons name="call" size={16} color="#10B981" />
                        </View>
                        <View className="ml-2">
                          <Text
                            className="text-gray-500 font-lregular"
                            style={{ fontSize: fontSize.tiny }}
                          >
                            Contact
                          </Text>
                          <Text
                            className="text-gray-800 font-lmedium"
                            style={{ fontSize: fontSize.small }}
                          >
                            {item.contactNumber}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Languages */}
                    <View className="mb-4">
                      <Text
                        className="text-gray-700 mb-2 font-lmedium"
                        style={{ fontSize: fontSize.small }}
                      >
                        Languages spoken:
                      </Text>
                      <View className="flex-row flex-wrap">
                        {item.languages.map((lang, index) => (
                          <View
                            key={index}
                            className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-1"
                          >
                            <Text
                              className="text-gray-700 font-lregular"
                              style={{ fontSize: fontSize.small }}
                            >
                              {lang}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Action buttons */}
                    <View className="flex-row justify-between mt-2">
                      <TouchableOpacity
                        className="bg-white border border-blue-600 rounded-full py-2.5 px-4 flex-1 mr-2 items-center flex-row justify-center"
                        onPress={() => handleSaveProfile(item)}
                      >
                        <Ionicons
                          name="bookmark-outline"
                          size={16}
                          color="#3B82F6"
                          className="mr-1"
                        />
                        <Text
                          className="text-blue-600 font-lbold ml-1"
                          style={{ fontSize: fontSize.small }}
                        >
                          Save Profile
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-blue-600 rounded-full py-2.5 px-4 flex-1 ml-2 items-center flex-row justify-center"
                        onPress={() => handleHire(item)}
                      >
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={16}
                          color="white"
                          className="mr-1"
                        />
                        <Text
                          className="text-white font-lbold ml-1"
                          style={{ fontSize: fontSize.small }}
                        >
                          Hire Worker
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Quick action buttons */}
                    <View className="flex-row mt-3">
                      <TouchableOpacity
                        className="bg-gray-50 border border-gray-200 rounded-full py-2 flex-1 mr-1 items-center flex-row justify-center"
                        onPress={() => handleCall(item.contactNumber)}
                      >
                        <Ionicons
                          name="call-outline"
                          size={15}
                          color="#4B5563"
                        />
                        <Text
                          className="text-gray-700 font-lmedium ml-1"
                          style={{ fontSize: fontSize.tiny }}
                        >
                          Call
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-gray-50 border border-gray-200 rounded-full py-2 flex-1 mx-1 items-center flex-row justify-center"
                        onPress={() => handleSMS(item.contactNumber)}
                      >
                        <Ionicons
                          name="chatbubble-outline"
                          size={15}
                          color="#4B5563"
                        />
                        <Text
                          className="text-gray-700 font-lmedium ml-1"
                          style={{ fontSize: fontSize.tiny }}
                        >
                          Message
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-gray-50 border border-gray-200 rounded-full py-2 flex-1 ml-1 items-center flex-row justify-center"
                        onPress={() =>
                          router.push({
                            pathname: "/sramika/workerprofile",
                            params: { workerId: item.id },
                          })
                        }
                      >
                        <Ionicons
                          name="person-outline"
                          size={15}
                          color="#4B5563"
                        />
                        <Text
                          className="text-gray-700 font-lmedium ml-1"
                          style={{ fontSize: fontSize.tiny }}
                        >
                          View Profile
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          )}
        />
      )}

      {/* Hire Modal */}
      {renderHireModal()}
    </SafeAreaView>
  );
};

// StyleSheet for additional styles
const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  badgeSuccess: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#10B981",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
});

export default SearchResultsPage;