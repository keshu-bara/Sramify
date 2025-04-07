import React, { useState } from "react";
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
    Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { addLabourProfile } from "../../libs/database"; 

const AddLabourPage = () => {
    // Form state
    const [formData, setFormData] = useState({
        // Personal Details
        fullName: "",
        age: "",
        phone: "",
        location: "",
        languages: "",
        photo: null,
        idProof: null,
        
        // Professional Details
        skills: [],
        experience: "",
        hourlyRate: "",
        availability: "Immediate",
        
        // Other Settings
        verified: false,
        completedJobs: "0"
    });

    // Loading state for form submission
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Available skills for selection
    const availableSkills = [
        "Construction", "Painting", "Plumbing", "Electrical", 
        "Carpentry", "Masonry", "Welding", "Tiling"
    ];

    // Available availabilities for selection
    const availableAvailabilities = [
        "Immediate", "Within 2 days", "Within a week", "After a week"
    ];

    // Current page in multi-step form
    const [currentStep, setCurrentStep] = useState(1);
    
    // Error state
    const [errors, setErrors] = useState({});

    const updateFormData = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });
        // Clear error for this field if it exists
        if (errors[field]) {
            setErrors({
                ...errors,
                [field]: null
            });
        }
    };

    const toggleSkill = (skill) => {
        if (formData.skills.includes(skill)) {
            updateFormData('skills', formData.skills.filter(s => s !== skill));
        } else {
            updateFormData('skills', [...formData.skills, skill]);
        }
    };

    const pickImage = async (field) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: field === 'photo' ? [1, 1] : [4, 3],
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
            
            if (!formData.age.trim()) {
                stepErrors.age = "Age is required";
                isValid = false;
            } else if (isNaN(formData.age) || parseInt(formData.age) < 18 || parseInt(formData.age) > 70) {
                stepErrors.age = "Enter a valid age between 18-70";
                isValid = false;
            }
            
            if (!formData.phone.trim()) {
                stepErrors.phone = "Phone number is required";
                isValid = false;
            } else if (!/^\d{10}$/.test(formData.phone.trim())) {
                stepErrors.phone = "Enter a valid 10-digit phone number";
                isValid = false;
            }
            
            if (!formData.location.trim()) {
                stepErrors.location = "Location is required";
                isValid = false;
            }
            
            if (!formData.languages.trim()) {
                stepErrors.languages = "Languages spoken is required";
                isValid = false;
            }
        } else if (step === 2) {
            // Validate professional details
            if (formData.skills.length === 0) {
                stepErrors.skills = "At least one skill is required";
                isValid = false;
            }
            
            if (!formData.experience.trim()) {
                stepErrors.experience = "Experience is required";
                isValid = false;
            } else if (isNaN(formData.experience) || parseInt(formData.experience) < 0 || parseInt(formData.experience) > 50) {
                stepErrors.experience = "Enter valid experience (0-50 years)";
                isValid = false;
            }
            
            if (!formData.hourlyRate.trim()) {
                stepErrors.hourlyRate = "Hourly rate is required";
                isValid = false;
            } else if (isNaN(formData.hourlyRate) || parseInt(formData.hourlyRate) < 100) {
                stepErrors.hourlyRate = "Enter a valid hourly rate (min ₹100)";
                isValid = false;
            }
            
            if (!formData.availability) {
                stepErrors.availability = "Availability is required";
                isValid = false;
            }
        } else if (step === 3) {
            // Validate document uploads
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
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        if (validateStep(currentStep)) {
            try {
                setIsSubmitting(true);
                
                // Convert data to match database schema
                const labourProfile = {
                    ...formData,
                    // Ensure numeric fields are correctly formatted
                    age: parseInt(formData.age),
                    experience: parseInt(formData.experience),
                    hourlyRate: parseInt(formData.hourlyRate),
                    completedJobs: parseInt(formData.completedJobs || '0'),
                    // Convert availability to string if it's not already
                    availability: formData.availability.toString(),
                    // Convert languages to string format expected by database
                    languages: formData.languages.toString()
                };
                
                // Call database function to save profile
                const labourId = await addLabourProfile(labourProfile);
                
                console.log("Labour added with ID:", labourId);
                
                // Show success message
                Alert.alert(
                    "Success",
                    "Labour profile added successfully!",
                    [{ text: "OK", onPress: () => router.push('/sramikarta/dashboard') }]
                );
            } catch (error) {
                console.error("Error saving labour profile:", error);
                Alert.alert(
                    "Error",
                    "Failed to add labour profile. Please try again.",
                    [{ text: "OK" }]
                );
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const renderInputField = (label, field, placeholder, keyboardType = "default", isSecure = false) => (
        <View className="mb-4">
            <Text className="text-gray-700 mb-1 font-lregular">{label}</Text>
            <TextInput
                className={`border ${errors[field] ? 'border-red-500' : 'border-gray-300'} 
                    rounded-lg p-3 bg-gray-50 text-gray-800 font-lregular`}
                placeholder={placeholder}
                value={formData[field]}
                onChangeText={(text) => updateFormData(field, text)}
                keyboardType={keyboardType}
                secureTextEntry={isSecure}
            />
            {errors[field] && (
                <Text className="text-red-500 text-xs mt-1 font-lregular">{errors[field]}</Text>
            )}
        </View>
    );

    const renderPersonalDetailsForm = () => (
        <View>
            <Text className="text-blue-600 text-xl mb-4 font-lbold">Personal Details</Text>
            
            {renderInputField("Full Name", "fullName", "Enter labour's full name")}
            {renderInputField("Age", "age", "Enter age", "numeric")}
            {renderInputField("Phone Number", "phone", "Enter 10-digit mobile number", "phone-pad")}
            {renderInputField("Location", "location", "Area, City (e.g. Indira Nagar, Bangalore)")}
            {renderInputField("Languages Spoken", "languages", "Comma separated (e.g. Hindi, English)")}
        </View>
    );

    const renderProfessionalDetailsForm = () => (
        <View>
            <Text className="text-blue-600 text-xl mb-4 font-lbold">Professional Details</Text>
            
            <View className="mb-4">
                <Text className="text-gray-700 mb-2 font-lregular">Skills</Text>
                <View className="flex-row flex-wrap">
                    {availableSkills.map((skill) => (
                        <TouchableOpacity 
                            key={skill}
                            onPress={() => toggleSkill(skill)}
                            className={`m-1 px-3 py-2 rounded-full ${
                                formData.skills.includes(skill) 
                                    ? 'bg-blue-500' 
                                    : 'bg-gray-200'
                            }`}
                        >
                            <Text 
                                className={`${
                                    formData.skills.includes(skill) 
                                        ? 'text-white' 
                                        : 'text-gray-700'
                                } font-lregular`}
                            >
                                {skill}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                {errors.skills && (
                    <Text className="text-red-500 text-xs mt-1 font-lregular">{errors.skills}</Text>
                )}
            </View>
            
            {renderInputField("Experience (Years)", "experience", "Enter years of experience", "numeric")}
            {renderInputField("Hourly Rate (₹)", "hourlyRate", "Enter hourly rate in rupees", "numeric")}
            
            <View className="mb-4">
                <Text className="text-gray-700 mb-1 font-lregular">Availability</Text>
                <View className="border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
                    {availableAvailabilities.map((option, index) => (
                        <TouchableOpacity
                            key={option}
                            onPress={() => updateFormData('availability', option)}
                            className={`p-3 ${
                                index < availableAvailabilities.length - 1 ? 'border-b border-gray-300' : ''
                            } ${
                                formData.availability === option ? 'bg-blue-50' : ''
                            }`}
                        >
                            <View className="flex-row items-center">
                                <View className={`w-5 h-5 rounded-full border ${
                                    formData.availability === option 
                                        ? 'border-blue-500 bg-blue-500' 
                                        : 'border-gray-400'
                                } mr-3 items-center justify-center`}>
                                    {formData.availability === option && (
                                        <View className="w-2 h-2 rounded-full bg-white" />
                                    )}
                                </View>
                                <Text className="text-gray-800 font-lregular">{option}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );

    const renderVerificationForm = () => (
        <View>
            <Text className="text-blue-600 text-xl mb-4 font-lbold">Photos & Verification</Text>
            
            <View className="mb-6">
                <Text className="text-gray-700 mb-2 font-lregular">Profile Photo</Text>
                <TouchableOpacity 
                    onPress={() => pickImage('photo')}
                    className={`border-2 border-dashed ${errors.photo ? 'border-red-500' : 'border-gray-300'} 
                        rounded-lg p-4 items-center justify-center h-32`}
                >
                    {formData.photo ? (
                        <Image 
                            source={{ uri: formData.photo }} 
                            className="w-full h-full rounded-lg"
                            style={{ width: '100%', height: '100%', borderRadius: 8 }}
                        />
                    ) : (
                        <View className="items-center">
                            <Ionicons name="camera" size={32} color="#666" />
                            <Text className="text-gray-600 mt-2 font-lregular">Upload Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>
                {errors.photo && (
                    <Text className="text-red-500 text-xs mt-1 font-lregular">{errors.photo}</Text>
                )}
            </View>
            
            <View className="mb-6">
                <Text className="text-gray-700 mb-2 font-lregular">ID Proof (Aadhaar/PAN/Voter ID)</Text>
                <TouchableOpacity 
                    onPress={() => pickImage('idProof')}
                    className={`border-2 border-dashed ${errors.idProof ? 'border-red-500' : 'border-gray-300'} 
                        rounded-lg p-4 items-center justify-center h-32`}
                >
                    {formData.idProof ? (
                        <Image 
                            source={{ uri: formData.idProof }} 
                            className="w-full h-full rounded-lg"
                            style={{ width: '100%', height: '100%', borderRadius: 8 }}
                        />
                    ) : (
                        <View className="items-center">
                            <Ionicons name="document" size={32} color="#666" />
                            <Text className="text-gray-600 mt-2 font-lregular">Upload ID Proof</Text>
                        </View>
                    )}
                </TouchableOpacity>
                {errors.idProof && (
                    <Text className="text-red-500 text-xs mt-1 font-lregular">{errors.idProof}</Text>
                )}
            </View>
            
            <View className="mb-3">
                <View className="flex-row justify-between items-center py-2">
                    <Text className="text-gray-700 font-lregular">Mark as Verified Labour</Text>
                    <Switch
                        value={formData.verified}
                        onValueChange={(value) => updateFormData('verified', value)}
                        trackColor={{ false: "#ccc", true: "#93C5FD" }}
                        thumbColor={formData.verified ? "#3B82F6" : "#f4f3f4"}
                    />
                </View>
                <Text className="text-gray-500 text-xs font-lregular">
                    Verified labours are more likely to get hired
                </Text>
            </View>
            
            <View className="mb-4">
                <Text className="text-gray-700 mb-1 font-lregular">Completed Jobs</Text>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-800 font-lregular"
                    placeholder="Number of jobs completed previously"
                    value={formData.completedJobs}
                    onChangeText={(text) => updateFormData('completedJobs', text)}
                    keyboardType="numeric"
                />
            </View>
        </View>
    );

    const renderProgressBar = () => (
        <View className="flex-row justify-between mb-6 mt-2">
            {[1, 2, 3].map((step) => (
                <View key={step} className="flex-1 px-1">
                    <View 
                        className={`h-2 rounded-full ${
                            step <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                    />
                </View>
            ))}
        </View>
    );

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return renderPersonalDetailsForm();
            case 2:
                return renderProfessionalDetailsForm();
            case 3:
                return renderVerificationForm();
            default:
                return null;
        }
    };

    const renderButtons = () => (
        <View className="flex-row justify-between mt-4">
            {currentStep > 1 && (
                <TouchableOpacity
                    className="bg-gray-200 py-3 px-6 rounded-full"
                    onPress={handlePrevious}
                    disabled={isSubmitting}
                >
                    <Text className="text-gray-700 font-lbold">Back</Text>
                </TouchableOpacity>
            )}
            
            <TouchableOpacity
                className={`${isSubmitting ? 'bg-blue-400' : 'bg-blue-600'} py-3 px-6 rounded-full ml-auto`}
                onPress={currentStep < 3 ? handleNext : handleSubmit}
                disabled={isSubmitting}
            >
                <View className="flex-row items-center">
                    {isSubmitting && currentStep === 3 && (
                        <View className="mr-2">
                            {/* Use ActivityIndicator here if you want to show a loading spinner */}
                            <Text className="text-white">●</Text>
                        </View>
                    )}
                    <Text className="text-white font-lbold">
                        {currentStep < 3 ? "Next" : (isSubmitting ? "Saving..." : "Add Labour")}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-blue-600 pt-2 pb-4 px-4">
                <View className="flex-row items-center">
                    <TouchableOpacity 
                        className="mr-2" 
                        onPress={() => router.back()}
                        disabled={isSubmitting}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-lbold text-white">Add New Labour</Text>
                </View>
            </View>
            
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView className="flex-1 px-4 py-4">
                    {renderProgressBar()}
                    {renderStepContent()}
                    {renderButtons()}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default AddLabourPage;