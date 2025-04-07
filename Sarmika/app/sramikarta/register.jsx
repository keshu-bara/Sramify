import React, { useState, useRef } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  Dimensions,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import LabourDB from "../../libs/database";

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 380;

// Mock data for contractors
let contractors = [];

export const ContractorRegistrationPage = ({ navigation }) => {
  // Form state
  const [formData, setFormData] = useState({
    // Personal Details
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
    photo: null,
    idProof: null,

    // Bank Details
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",

    // Other Settings
    receiveNotifications: true,
    shareLocationData: true,
    agreeToTerms: false,
  });

  // Current page in multi-step form
  const [currentStep, setCurrentStep] = useState(1);

  // Error state
  const [errors, setErrors] = useState({});

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(33.33)).current;

  // Handle form transition animations
  const animateTransition = (next) => {
    // Fade out current content
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Update step
      setCurrentStep(next);

      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: next * 33.33,
        duration: 300,
        useNativeDriver: false,
      }).start();

      // Set slide direction based on navigation direction
      slideAnim.setValue(next > currentStep ? width : -width);

      // Slide in and fade in new content
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const updateFormData = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  const pickImage = async (field) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: field === "photo" ? [1, 1] : [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      updateFormData(field, result.assets[0].uri);
    }
  };

  const validateStep = (step) => {
    let stepErrors = {};
    let isValid = true;

    if (step === 1) {
      // Validate personal details
      if (!formData.fullName.trim()) {
        stepErrors.fullName = "Name is required";
        isValid = false;
      }

      if (!formData.phone.trim()) {
        stepErrors.phone = "Phone number is required";
        isValid = false;
      } else if (!/^\d{10}$/.test(formData.phone.trim())) {
        stepErrors.phone = "Enter a valid 10-digit phone number";
        isValid = false;
      }

      if (!formData.email.trim()) {
        stepErrors.email = "Email is required";
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        stepErrors.email = "Enter a valid email address";
        isValid = false;
      }

      if (!formData.address.trim()) {
        stepErrors.address = "Address is required";
        isValid = false;
      }

      if (!formData.city.trim()) {
        stepErrors.city = "City is required";
        isValid = false;
      }

      if (!formData.pincode.trim()) {
        stepErrors.pincode = "PIN code is required";
        isValid = false;
      } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
        stepErrors.pincode = "Enter a valid 6-digit PIN code";
        isValid = false;
      }
    } else if (step === 2) {
      // Validate bank details
      if (!formData.accountHolder.trim()) {
        stepErrors.accountHolder = "Account holder name is required";
        isValid = false;
      }

      if (!formData.accountNumber.trim()) {
        stepErrors.accountNumber = "Account number is required";
        isValid = false;
      } else if (!/^\d{9,18}$/.test(formData.accountNumber.trim())) {
        stepErrors.accountNumber = "Enter a valid account number";
        isValid = false;
      }

      if (!formData.ifscCode.trim()) {
        stepErrors.ifscCode = "IFSC code is required";
        isValid = false;
      } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.trim())) {
        stepErrors.ifscCode = "Enter a valid IFSC code";
        isValid = false;
      }

      if (!formData.bankName.trim()) {
        stepErrors.bankName = "Bank name is required";
        isValid = false;
      }
    } else if (step === 3) {
      // Validate terms agreement
      if (!formData.agreeToTerms) {
        stepErrors.agreeToTerms = "You must agree to the terms and conditions";
        isValid = false;
      }

      if (!formData.photo) {
        stepErrors.photo = "Profile photo is required";
        isValid = false;
      }

      if (!formData.idProof) {
        stepErrors.idProof = "ID proof is required";
        isValid = false;
      }
    }

    setErrors(stepErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      animateTransition(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    animateTransition(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      try {
        console.log("Preparing to submit contractor data...");
        
        // Make sure all required fields are included
        const contractorData = {
          // Personal details
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city || "", // This was missing in the test data
          pincode: formData.pincode || "",
          photo: formData.photo || "",
          idProof: formData.idProof || "",
          
          // Bank details
          accountHolder: formData.accountHolder || "",
          accountNumber: formData.accountNumber || "",
          ifscCode: formData.ifscCode || "",
          bankName: formData.bankName || "",
          
          // Other settings
          receiveNotifications: formData.receiveNotifications ? 1 : 0,
          shareLocationData: formData.shareLocationData ? 1 : 0,
          agreeToTerms: formData.agreeToTerms ? 1 : 0,
          
          // Add timestamp
          created_at: new Date().toISOString()
        };
        
        console.log("Submitting with all required fields:", contractorData);
        await LabourDB.addContractorProfile(contractorData);
        
        Alert.alert(
          "Registration Successful",
          "Your contractor account has been created successfully!",
          [{ text: "Continue", onPress: () => router.push("/sramikarta/dashboard") }]
        );
      } catch (error) {
        console.error("Error adding contractor profile:", error);
        
        Alert.alert(
          "Registration Failed",
          `There was a problem with your registration: ${error.message}`,
          [{ text: "OK" }]
        );
      }
    }
  };

  const renderInputField = (
    label,
    field,
    placeholder,
    keyboardType = "default",
    isSecure = false,
    icon = null
  ) => (
    <View className="mb-4">
      <Text className="text-gray-700 mb-2 font-lmedium">{label}</Text>
      <View
        className={`flex-row border ${
          errors[field] ? "border-red-500" : "border-gray-300"
        } 
                rounded-xl overflow-hidden bg-gray-50`}
      >
        {icon && (
          <View className="py-3 px-4 bg-gray-100 justify-center items-center">
            <Ionicons name={icon} size={20} color="#4B5563" />
          </View>
        )}
        <TextInput
          className="flex-1 p-3.5 text-gray-800 font-lregular"
          placeholder={placeholder}
          value={formData[field]}
          onChangeText={(text) => updateFormData(field, text)}
          keyboardType={keyboardType}
          secureTextEntry={isSecure}
          placeholderTextColor="#9CA3AF"
        />
      </View>
      {errors[field] && (
        <View className="flex-row items-center mt-1.5">
          <Ionicons name="alert-circle" size={14} color="#EF4444" />
          <Text className="text-red-500 text-xs ml-1 font-lregular">
            {errors[field]}
          </Text>
        </View>
      )}
    </View>
  );

  const renderPersonalDetailsForm = () => (
    <View>
      <View className="mb-6 items-center">
        <View className="w-24 h-24 bg-blue-100 rounded-full justify-center items-center mb-3">
          <FontAwesome5 name="user-alt" size={36} color="#60A5FA" />
        </View>
        <Text className="text-blue-600 text-xl font-lbold">
          Personal Details
        </Text>
        <Text className="text-gray-500 text-sm font-lregular mt-1">
          Tell us about yourself
        </Text>
      </View>

      {renderInputField(
        "Full Name",
        "fullName",
        "Enter your full name",
        "default",
        false,
        "person"
      )}
      {renderInputField(
        "Phone Number",
        "phone",
        "Enter 10-digit mobile number",
        "phone-pad",
        false,
        "call"
      )}
      {renderInputField(
        "Email",
        "email",
        "Enter your email address",
        "email-address",
        false,
        "mail"
      )}
      {renderInputField(
        "Address",
        "address",
        "Enter your street address",
        "default",
        false,
        "location"
      )}

      <View className="flex-row mb-4">
        <View className="flex-1 mr-2">
          {renderInputField(
            "City",
            "city",
            "Your city",
            "default",
            false,
            "business"
          )}
        </View>
        <View className="flex-1 ml-2">
          {renderInputField(
            "PIN Code",
            "pincode",
            "6-digit PIN code",
            "numeric",
            false,
            "pin"
          )}
        </View>
      </View>
    </View>
  );

  const renderBankDetailsForm = () => (
    <View>
      <View className="mb-6 items-center">
        <View className="w-24 h-24 bg-blue-100 rounded-full justify-center items-center mb-3">
          <FontAwesome5 name="university" size={36} color="#60A5FA" />
        </View>
        <Text className="text-blue-600 text-xl font-lbold">
          Bank Account Details
        </Text>
        <Text className="text-gray-500 text-sm font-lregular mt-1">
          Your payments will be sent to this account
        </Text>
      </View>

      {renderInputField(
        "Account Holder Name",
        "accountHolder",
        "Name as per bank records",
        "default",
        false,
        "person"
      )}
      {renderInputField(
        "Account Number",
        "accountNumber",
        "Enter account number",
        "numeric",
        false,
        "card"
      )}
      {renderInputField(
        "IFSC Code",
        "ifscCode",
        "Bank IFSC code",
        "default",
        false,
        "code"
      )}
      {renderInputField(
        "Bank Name",
        "bankName",
        "Name of your bank",
        "default",
        false,
        "business"
      )}
    </View>
  );

  const renderVerificationForm = () => (
    <View>
      <View className="mb-6 items-center">
        <View className="w-24 h-24 bg-blue-100 rounded-full justify-center items-center mb-3">
          <FontAwesome5 name="shield-alt" size={36} color="#60A5FA" />
        </View>
        <Text className="text-blue-600 text-xl font-lbold">
          Verification & Preferences
        </Text>
        <Text className="text-gray-500 text-sm font-lregular mt-1">
          Complete your profile setup
        </Text>
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 mb-2 font-lmedium">Profile Photo</Text>
        <TouchableOpacity
          onPress={() => pickImage("photo")}
          className={`border-2 border-dashed ${
            errors.photo ? "border-red-500" : "border-blue-300"
          } 
                        rounded-xl p-4 items-center justify-center h-36 bg-blue-50`}
          style={{
            elevation: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          }}
        >
          {formData.photo ? (
            <Image
              source={{ uri: formData.photo }}
              className="w-full h-full rounded-lg"
              style={{ width: "100%", height: "100%", borderRadius: 8 }}
            />
          ) : (
            <View className="items-center">
              <Ionicons name="camera" size={36} color="#3B82F6" />
              <Text className="text-blue-600 mt-2 font-lmedium">
                Upload Profile Photo
              </Text>
              <Text className="text-gray-500 text-xs mt-1 font-lregular">
                Tap to choose image
              </Text>
            </View>
          )}
        </TouchableOpacity>
        {errors.photo && (
          <View className="flex-row items-center mt-1.5">
            <Ionicons name="alert-circle" size={14} color="#EF4444" />
            <Text className="text-red-500 text-xs ml-1 font-lregular">
              {errors.photo}
            </Text>
          </View>
        )}
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 mb-2 font-lmedium">
          ID Proof (Aadhaar/PAN/Voter ID)
        </Text>
        <TouchableOpacity
          onPress={() => pickImage("idProof")}
          className={`border-2 border-dashed ${
            errors.idProof ? "border-red-500" : "border-blue-300"
          } 
                        rounded-xl p-4 items-center justify-center h-36 bg-blue-50`}
          style={{
            elevation: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          }}
        >
          {formData.idProof ? (
            <Image
              source={{ uri: formData.idProof }}
              className="w-full h-full rounded-lg"
              style={{ width: "100%", height: "100%", borderRadius: 8 }}
            />
          ) : (
            <View className="items-center">
              <Ionicons name="document-text" size={36} color="#3B82F6" />
              <Text className="text-blue-600 mt-2 font-lmedium">
                Upload ID Proof
              </Text>
              <Text className="text-gray-500 text-xs mt-1 font-lregular">
                Tap to choose image
              </Text>
            </View>
          )}
        </TouchableOpacity>
        {errors.idProof && (
          <View className="flex-row items-center mt-1.5">
            <Ionicons name="alert-circle" size={14} color="#EF4444" />
            <Text className="text-red-500 text-xs ml-1 font-lregular">
              {errors.idProof}
            </Text>
          </View>
        )}
      </View>

      <View className="mb-5 bg-gray-50 p-4 rounded-xl">
        <View className="flex-row justify-between items-center py-2 mb-1">
          <View className="flex-row items-center">
            <Ionicons name="notifications" size={20} color="#4B5563" />
            <Text className="text-gray-700 font-lmedium ml-3">
              Receive Job Notifications
            </Text>
          </View>
          <Switch
            value={formData.receiveNotifications}
            onValueChange={(value) =>
              updateFormData("receiveNotifications", value)
            }
            trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
            thumbColor={formData.receiveNotifications ? "#2563EB" : "#f4f3f4"}
            ios_backgroundColor="#D1D5DB"
          />
        </View>

        <View className="flex-row justify-between items-center py-2">
          <View className="flex-row items-center">
            <Ionicons name="location" size={20} color="#4B5563" />
            <Text className="text-gray-700 font-lmedium ml-3">
              Share Location Data
            </Text>
          </View>
          <Switch
            value={formData.shareLocationData}
            onValueChange={(value) =>
              updateFormData("shareLocationData", value)
            }
            trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
            thumbColor={formData.shareLocationData ? "#2563EB" : "#f4f3f4"}
            ios_backgroundColor="#D1D5DB"
          />
        </View>
      </View>

      <View className="mb-4">
        <TouchableOpacity
          className="flex-row items-center py-3 bg-gray-50 px-4 rounded-xl"
          onPress={() => updateFormData("agreeToTerms", !formData.agreeToTerms)}
        >
          <View
            className={`w-6 h-6 mr-3 rounded-md ${
              formData.agreeToTerms
                ? "bg-blue-600 border-blue-600"
                : errors.agreeToTerms
                ? "border-2 border-red-500"
                : "border-2 border-gray-300"
            } items-center justify-center`}
          >
            {formData.agreeToTerms && (
              <Ionicons name="checkmark" size={18} color="white" />
            )}
          </View>
          <Text className="text-gray-700 flex-1 font-lmedium">
            I agree to the Terms of Service and Privacy Policy
          </Text>
        </TouchableOpacity>
        {errors.agreeToTerms && (
          <View className="flex-row items-center mt-1.5 ml-9">
            <Ionicons name="alert-circle" size={14} color="#EF4444" />
            <Text className="text-red-500 text-xs ml-1 font-lregular">
              {errors.agreeToTerms}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderStepIndicator = () => (
    <View className="mb-6">
      <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <Animated.View
          className="h-full bg-blue-600"
          style={{
            width: progressAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
            }),
          }}
        />
      </View>

      <View className="flex-row justify-between mt-2">
        <View className="items-center">
          <View
            className={`w-8 h-8 rounded-full ${
              currentStep >= 1 ? "bg-blue-600" : "bg-gray-300"
            } 
                        items-center justify-center mb-1`}
          >
            <Text className="text-white font-lbold">1</Text>
          </View>
          <Text
            className={`text-xs ${
              currentStep >= 1 ? "text-blue-600" : "text-gray-500"
            } font-lmedium`}
          >
            Personal
          </Text>
        </View>

        <View className="items-center">
          <View
            className={`w-8 h-8 rounded-full ${
              currentStep >= 2 ? "bg-blue-600" : "bg-gray-300"
            } 
                        items-center justify-center mb-1`}
          >
            <Text className="text-white font-lbold">2</Text>
          </View>
          <Text
            className={`text-xs ${
              currentStep >= 2 ? "text-blue-600" : "text-gray-500"
            } font-lmedium`}
          >
            Bank
          </Text>
        </View>

        <View className="items-center">
          <View
            className={`w-8 h-8 rounded-full ${
              currentStep >= 3 ? "bg-blue-600" : "bg-gray-300"
            } 
                        items-center justify-center mb-1`}
          >
            <Text className="text-white font-lbold">3</Text>
          </View>
          <Text
            className={`text-xs ${
              currentStep >= 3 ? "text-blue-600" : "text-gray-500"
            } font-lmedium`}
          >
            Verify
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStepContent = () => {
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        }}
        className="flex-1"
      >
        {currentStep === 1 && renderPersonalDetailsForm()}
        {currentStep === 2 && renderBankDetailsForm()}
        {currentStep === 3 && renderVerificationForm()}
      </Animated.View>
    );
  };

  const renderButtons = () => (
    <View className="mt-6">
      {currentStep === 3 ? (
        <TouchableOpacity onPress={handleSubmit} className="w-full">
          <LinearGradient
            colors={["#3B82F6", "#1D4ED8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="py-4 rounded-xl items-center justify-center"
          >
            <Text className="text-white font-lbold text-lg">
              Complete Registration
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          className="bg-blue-600 py-4 rounded-xl items-center"
          onPress={handleNext}
          style={{
            elevation: 2,
            shadowColor: "#2563EB",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
          }}
        >
          <Text className="text-white font-lbold text-lg">Continue</Text>
        </TouchableOpacity>
      )}

      {currentStep > 1 && (
        <TouchableOpacity
          className="mt-4 py-3 rounded-xl items-center"
          onPress={handlePrevious}
        >
          <Text className="text-gray-700 font-lmedium">Go Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#1D4ED8" />

      {/* Header */}
      <LinearGradient
        colors={["#2563EB", "#1D4ED8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-2 pb-6 px-5"
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
              Join as Contractor
            </Text>
          </View>
        </View>

        <Text className="text-blue-100 mt-1 font-lregular">
          Complete the form to start finding workers
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-5 pt-6"
          showsVerticalScrollIndicator={false}
        >
          {renderStepIndicator()}
          {renderStepContent()}
          {renderButtons()}

          <View className="h-10" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ContractorRegistrationPage;
