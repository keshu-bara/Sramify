import React from "react";
import {
  Text,
  Pressable,
  View,
  ImageBackground,
  Image,
  StatusBar,
  useWindowDimensions,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  Feather,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { BlurView } from "expo-blur";

// Updated theme for a more professional labor registration portal
const theme = {
  colors: {
    primary: "#3B82F6", // Blue-500 as primary color
    primaryDark: "#1D4ED8", // Blue-700
    primaryLight: "#60A5FA", // Blue-400
    secondary: "#F59E0B", // Amber-500 as accent
    secondaryLight: "#FBBF24", // Amber-400
    secondaryDark: "#D97706", // Amber-600
    background: "#F9FAFB", // Very light gray background
    surface: "#FFFFFF",
    text: "#1F2937", // Gray-800
    textLight: "#4B5563", // Gray-600
    success: "#10B981", // Green-500
    border: "#E5E7EB", // Gray-200
  },
  gradients: {
    header: ["#2563EB", "#3B82F6", "#60A5FA"], // Professional blue gradient
    contractor: ["#F59E0B", "#F97316", "#EA580C"], // Orange-amber for contractor
    labor: ["#10B981", "#059669", "#047857"], // Green for labor
    card: ["#F3F4F6", "#F9FAFB"], // Light gray gradient
    footer: ["#EFF6FF", "#DBEAFE"], // Light blue gradient
  },
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 5,
    },
  },
};

// Define responsive sizing
const useResponsiveValues = () => {
  const { width, height } = useWindowDimensions();
  const isSmallDevice = width < 380;
  const isMediumDevice = width >= 380 && width < 768;
  const isLargeDevice = width >= 768;

  return {
    isSmallDevice,
    isMediumDevice,
    isLargeDevice,
    headerHeight: isSmallDevice ? 200 : isMediumDevice ? 220 : 240,
    headerPadding:
      Platform.OS === "ios"
        ? isSmallDevice
          ? "12"
          : "14"
        : (StatusBar.currentHeight + (isSmallDevice ? 8 : 12)).toString(),
    iconSize: isSmallDevice ? 32 : isMediumDevice ? 36 : 42,
    titleSize: isSmallDevice ? 24 : isMediumDevice ? 28 : 32,
    bottomRadius: isSmallDevice ? 24 : 30,
    cardPadding: isSmallDevice ? 16 : isMediumDevice ? 20 : 24,
    buttonSize: {
      height: isSmallDevice ? 64 : isMediumDevice ? 72 : 80, // Reduced height for more professional look
      iconSize: isSmallDevice ? 22 : isMediumDevice ? 24 : 28, // Slightly smaller icons
      borderRadius: 12,
    },
  };
};

// Action button component - redesigned to be more professional
const ActionButton = ({
  icon,
  title,
  subtitle,
  gradient,
  onPress,
  iconBgColor,
  shadow,
}) => {
  const { buttonSize } = useResponsiveValues();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          transform: [{ scale: pressed ? 0.98 : 1 }],
          opacity: pressed ? 0.95 : 1,
        },
        shadow,
      ]}
      className="mb-4"
    >
      <MotiView
        from={{ opacity: 0, translateY: 15 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600 }}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            height: buttonSize.height,
            borderRadius: buttonSize.borderRadius,
            padding: 12,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.2)",
          }}
        >
          <View className="flex-row h-full items-center">
            <View
              style={{ backgroundColor: iconBgColor }}
              className="rounded-lg p-2 mr-3"
            >
              {React.cloneElement(icon, {
                size: buttonSize.iconSize,
                color: "white",
              })}
            </View>

            <View className="flex-1 justify-center">
              <Text
                style={{
                  fontSize: buttonSize.height * 0.25,
                  color: "white",
                  fontWeight: "700",
                }}
                className="font-lsemibold"
              >
                {title}
              </Text>
              <Text
                style={{
                  fontSize: buttonSize.height * 0.16,
                  color: "white",
                  opacity: 0.9,
                }}
                className="font-lregular"
              >
                {subtitle}
              </Text>
            </View>

            <View className="bg-white/20 rounded-full p-1.5 border border-white/30">
              <Feather
                name="chevron-right"
                size={buttonSize.iconSize * 0.7}
                color="white"
              />
            </View>
          </View>
        </LinearGradient>
      </MotiView>
    </Pressable>
  );
};

// Menu item component - more professional appearance
const MenuItem = ({ icon, title, onPress, delay }) => {
  const { isSmallDevice } = useResponsiveValues();

  return (
    <MotiView
      from={{ opacity: 0, translateX: -10 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: "timing", duration: 500, delay }}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          opacity: pressed ? 0.8 : 1,
          backgroundColor: pressed ? "#F3F4F6" : "white",
          borderRadius: 12,
          padding: isSmallDevice ? 10 : 12,
          marginBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          ...theme.shadows.sm,
        })}
      >
        <View
          style={{ backgroundColor: "#EFF6FF" }}
          className="rounded-full p-2 mr-3"
        >
          {React.cloneElement(icon, { color: theme.colors.primary })}
        </View>
        <Text
          style={{
            fontSize: isSmallDevice ? 14 : 16,
            color: theme.colors.text,
          }}
          className="font-lmedium flex-1"
        >
          {title}
        </Text>
        <Feather
          name="chevron-right"
          size={isSmallDevice ? 18 : 20}
          color={theme.colors.textLight}
        />
      </Pressable>
    </MotiView>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => {
  return (
    <View className="bg-white rounded-xl p-4 mb-3" style={theme.shadows.sm}>
      <View className="flex-row items-center mb-2">
        <View
          style={{ backgroundColor: "#EFF6FF" }}
          className="rounded-full p-2 mr-3"
        >
          {icon}
        </View>
        <Text
          className="text-base font-lsemibold"
          style={{ color: theme.colors.text }}
        >
          {title}
        </Text>
      </View>
      <Text className="text-sm" style={{ color: theme.colors.textLight }}>
        {description}
      </Text>
    </View>
  );
};

const Page = () => {
  const router = useRouter();
  const {
    isSmallDevice,
    isMediumDevice,
    isLargeDevice,
    headerHeight,
    headerPadding,
    iconSize,
    titleSize,
    bottomRadius,
    cardPadding,
  } = useResponsiveValues();

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: theme.colors.background }}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={theme.gradients.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: parseInt(headerPadding) + StatusBar.currentHeight || 40,
            paddingBottom: 60,
            borderBottomLeftRadius: bottomRadius,
            borderBottomRightRadius: bottomRadius,
          }}
          className="shadow-lg"
        >
          <SafeAreaView edges={["left", "right"]}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.95 : 1 }],
                opacity: pressed ? 0.9 : 1,
              })}
              className="absolute top-3 left-4 z-10 bg-white/20 backdrop-blur-lg rounded-full p-2"
            >
              <Ionicons name="chevron-back" size={22} color="white" />
            </Pressable>

            <View className="items-center justify-center px-4 pt-2">
              {/* Logo */}
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "timing", duration: 700 }}
                className="mb-3"
              >
                <View className="bg-white/20 rounded-full p-4 backdrop-blur-sm">
                  {/* Use the Sramify icon from assets */}
                  <Image
                    source={require("../../assets/Images/sramifyicon.png")}
                    style={{ width: iconSize, height: iconSize }}
                    resizeMode="contain"
                  />
                </View>
              </MotiView>

              {/* Title */}
              <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 700, delay: 200 }}
              >
                <Text
                  style={{ fontSize: titleSize }}
                  className="font-lbold text-white text-center"
                >
                  Sramify
                </Text>
                <Text className="text-center text-white/90 font-lregular text-base mt-1">
                  Labor Management Portal
                </Text>
              </MotiView>

              {/* Divider */}
              <MotiView
                from={{ opacity: 0, width: 100 }}
                animate={{ opacity: 1, width: 240 }}
                transition={{ type: "timing", duration: 700, delay: 300 }}
                className="flex-row items-center mt-6"
              >
                <View className="flex-1 h-[1px] bg-white/30" />
                <View className="bg-white/20 rounded-full px-3 py-1 mx-3">
                  <Text className="text-white/90 text-xs font-lmedium">
                    WORKFORCE MANAGEMENT
                  </Text>
                </View>
                <View className="flex-1 h-[1px] bg-white/30" />
              </MotiView>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Main Content */}
        <View
          style={{ marginTop: -40, padding: cardPadding, paddingBottom: 30 }}
        >
          {/* Welcome Card */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 700, delay: 400 }}
            style={theme.shadows.md}
            className="mb-6"
          >
            <View className="bg-white rounded-2xl overflow-hidden">
              <LinearGradient
                colors={["#EFF6FF", "#DBEAFE"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-4 py-3 border-b border-blue-100"
              >
                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name="hand-wave"
                    size={22}
                    color={theme.colors.primary}
                  />
                  <Text className="ml-2 font-lbold text-blue-800">
                    Welcome to Sramify
                  </Text>
                </View>
              </LinearGradient>

              <View className="p-4">
                <Text
                  className="text-base leading-5 mb-4"
                  style={{ color: theme.colors.textLight }}
                >
                  Manage your workforce efficiently with our comprehensive labor
                  management portal. Register workers, track projects, and
                  optimize your operations.
                </Text>

                <View className="flex-row items-center border-t border-gray-100 pt-3">
                  <FontAwesome5
                    name="info-circle"
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text className="ml-2 text-sm font-lmedium text-blue-700">
                    Select your role below
                  </Text>
                </View>
              </View>
            </View>
          </MotiView>

          {/* Action Buttons */}
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <FontAwesome5
                name="user-hard-hat"
                size={16}
                color={theme.colors.primary}
              />
              <Text
                className="font-lbold ml-2 text-lg"
                style={{ color: theme.colors.text }}
              >
                Registration Options
              </Text>
            </View>

            {/* Contractor Button */}
            <ActionButton
              icon={<MaterialCommunityIcons name="account-hard-hat" />}
              title="Contractor Registration"
              subtitle="Register & manage work teams"
              gradient={theme.gradients.contractor}
              onPress={() => router.push("/sramikarta/register")}
              iconBgColor="rgba(255,255,255,0.2)"
              shadow={theme.shadows.md}
            />

            {/* Labor Button */}
            <ActionButton
              icon={<MaterialCommunityIcons name="account-group" />}
              title="Hire Workers"
              subtitle="Find skilled labor for projects"
              gradient={theme.gradients.labor}
              onPress={() => router.push("/sramikarta/dashboard")}
              iconBgColor="rgba(255,255,255,0.2)"
              shadow={theme.shadows.md}
            />
          </View>

          {/* Key Features */}
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <MaterialCommunityIcons
                name="star"
                size={18}
                color={theme.colors.primary}
              />
              <Text
                className="font-lbold ml-2 text-lg"
                style={{ color: theme.colors.text }}
              >
                Key Features
              </Text>
            </View>

            <View className="flex-row flex-wrap" style={{ gap: 12 }}>
              <View style={{ width: isLargeDevice ? "48%" : "100%" }}>
                <FeatureCard
                  icon={
                    <MaterialCommunityIcons
                      name="account-check"
                      size={20}
                      color={theme.colors.primary}
                    />
                  }
                  title="Worker Verification"
                  description="Verify skills and credentials of all workers through our secure verification system"
                />
              </View>

              <View style={{ width: isLargeDevice ? "48%" : "100%" }}>
                <FeatureCard
                  icon={
                    <MaterialCommunityIcons
                      name="calendar-clock"
                      size={20}
                      color={theme.colors.primary}
                    />
                  }
                  title="Scheduling"
                  description="Efficiently manage worker schedules and project timelines"
                />
              </View>

              <View style={{ width: isLargeDevice ? "48%" : "100%" }}>
                <FeatureCard
                  icon={
                    <MaterialCommunityIcons
                      name="file-document"
                      size={20}
                      color={theme.colors.primary}
                    />
                  }
                  title="Digital Documentation"
                  description="Maintain all worker documents and certificates digitally"
                />
              </View>

              <View style={{ width: isLargeDevice ? "48%" : "100%" }}>
                <FeatureCard
                  icon={
                    <MaterialCommunityIcons
                      name="chart-bar"
                      size={20}
                      color={theme.colors.primary}
                    />
                  }
                  title="Workforce Analytics"
                  description="Access detailed insights about workforce performance and availability"
                />
              </View>
            </View>
          </View>

          {/* Admin Menu */}
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <MaterialCommunityIcons
                name="shield-account"
                size={18}
                color={theme.colors.primary}
              />
              <Text
                className="font-lbold ml-2 text-lg"
                style={{ color: theme.colors.text }}
              >
                Admin Dashboard
              </Text>
            </View>

            <View className="bg-white rounded-xl p-4" style={theme.shadows.sm}>
              <MenuItem
                icon={
                  <MaterialCommunityIcons name="account-multiple" size={20} />
                }
                title="Manage Workers"
                onPress={() => router.push("/sramikarta/workers")}
                delay={500}
              />
              <MenuItem
                icon={<MaterialCommunityIcons name="briefcase" size={20} />}
                title="View Projects"
                onPress={() => router.push("/sramikarta/projects")}
                delay={600}
              />
              <MenuItem
                icon={
                  <MaterialCommunityIcons name="clipboard-list" size={20} />
                }
                title="Manage Tasks"
                onPress={() => router.push("/sramikarta/tasks")}
                delay={700}
              />
              <MenuItem
                icon={
                  <MaterialCommunityIcons
                    name="chart-timeline-variant"
                    size={20}
                  />
                }
                title="Reports & Analytics"
                onPress={() => router.push("/sramikarta/analytics")}
                delay={800}
              />
            </View>
          </View>

          {/* Footer */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 700, delay: 800 }}
            className="mt-4"
          >
            <LinearGradient
              colors={theme.gradients.footer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-xl px-6 py-3 items-center"
              style={{
                borderWidth: 1,
                borderColor: "rgba(59, 130, 246, 0.2)",
              }}
            >
              <View className="flex-row items-center">
                <MaterialCommunityIcons
                  name="shield-check"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text className="text-xs font-lmedium ml-1.5 text-blue-700">
                  Sramify Workforce Management Solutions
                </Text>
              </View>
            </LinearGradient>
          </MotiView>
        </View>
      </ScrollView>
    </View>
  );
};

export default Page;
