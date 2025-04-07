import React, { useState, useEffect } from "react";
import { 
    Text, 
    View, 
    Image, 
    TouchableOpacity, 
    ScrollView, 
    Switch 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import LabourDB from "../../libs/database";

const ContractorProfilePage = () => {
    const [contractor, setContractor] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        pincode: "",
        photo: null,
        idProof: null,
        accountHolder: "",
        accountNumber: "",
        ifscCode: "",
        bankName: "",
        receiveNotifications: true,
        shareLocationData: true,
        agreeToTerms: false
    });

    useEffect(() => {
        const fetchContractor = async () => {
            try {
                const profiles = await LabourDB.getAllContractorProfiles();
                if (profiles.length > 0) {
                    setContractor(profiles[0]);
                    setFormData(profiles[0]);
                }
            } catch (error) {
                console.error("Error fetching contractor profile:", error);
            }
        };

        fetchContractor();
    }, []);

    const updateFormData = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });
    };

    const handleSave = async () => {
        try {
            await LabourDB.updateContractorProfile(contractor.id, formData);
            setContractor(formData);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating contractor profile:", error);
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

    if (!contractor) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <Text className="text-gray-600">Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-blue-600 pt-2 pb-4 px-4">
                <View className="flex-row items-center">
                    <TouchableOpacity 
                        className="mr-2" 
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-lbold text-white">Contractor Profile</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-4 py-4">
                <View className="items-center mb-6">
                    <Image 
                        source={{ uri: contractor.photo }} 
                        className="w-32 h-32 rounded-full"
                        style={{ width: 128, height: 128, borderRadius: 64 }}
                    />
                    <Text className="text-xl font-lbold text-gray-800 mt-4">{contractor.fullName}</Text>
                    <Text className="text-gray-600">{contractor.email}</Text>
                </View>

                <View className="mb-6">
                    <Text className="text-blue-600 text-xl mb-4 font-lbold">Personal Details</Text>
                    {renderInputField("Full Name", "fullName", "Enter your full name")}
                    {renderInputField("Phone Number", "phone", "Enter 10-digit mobile number", "phone-pad")}
                    {renderInputField("Email", "email", "Enter your email address", "email-address")}
                    {renderInputField("Address", "address", "Enter your street address")}
                    <View className="flex-row mb-4">
                        <View className="flex-1 mr-2">
                            {renderInputField("City", "city", "Your city")}
                        </View>
                        <View className="flex-1 ml-2">
                            {renderInputField("PIN Code", "pincode", "6-digit PIN code", "numeric")}
                        </View>
                    </View>
                </View>

                <View className="mb-6">
                    <Text className="text-blue-600 text-xl mb-4 font-lbold">Bank Account Details</Text>
                    {renderInputField("Account Holder Name", "accountHolder", "Name as per bank records")}
                    {renderInputField("Account Number", "accountNumber", "Enter account number", "numeric")}
                    {renderInputField("IFSC Code", "ifscCode", "Bank IFSC code")}
                    {renderInputField("Bank Name", "bankName", "Name of your bank")}
                </View>

                <View className="mb-6">
                    <Text className="text-blue-600 text-xl mb-4 font-lbold">Preferences</Text>
                    <View className="mb-3">
                        <View className="flex-row justify-between items-center py-2">
                            <Text className="text-gray-700 font-lregular">Receive Job Notifications</Text>
                            <Switch
                                value={formData.receiveNotifications}
                                onValueChange={(value) => updateFormData('receiveNotifications', value)}
                                trackColor={{ false: "#ccc", true: "#93C5FD" }}
                                thumbColor={formData.receiveNotifications ? "#3B82F6" : "#f4f3f4"}
                            />
                        </View>
                    </View>
                    <View className="mb-3">
                        <View className="flex-row justify-between items-center py-2">
                            <Text className="text-gray-700 font-lregular">Share Location Data</Text>
                            <Switch
                                value={formData.shareLocationData}
                                onValueChange={(value) => updateFormData('shareLocationData', value)}
                                trackColor={{ false: "#ccc", true: "#93C5FD" }}
                                thumbColor={formData.shareLocationData ? "#3B82F6" : "#f4f3f4"}
                            />
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    className="bg-blue-600 py-3 px-6 rounded-full"
                    onPress={handleSave}
                >
                    <Text className="text-white font-lbold text-center">Save Changes</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ContractorProfilePage;