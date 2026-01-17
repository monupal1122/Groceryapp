import React, { useState, useRef, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import CustomAlert from '../components/CustomAlert';
import { AuthContext } from "../context/AuthContext";

export default function OTPScreen({ route, navigation }) {
  const { email, username, fromCheckout } = route.params;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null
  });
  const { verifyOTP } = useContext(AuthContext);

  // Refs for 6 input boxes
  const inputs = useRef([]);

  const showCustomAlert = (title, message, type = 'info', onConfirm = null) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      onConfirm
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const handleChange = (text, index) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = text;
    setOtp(updatedOtp);

    // Move to next box automatically
    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleVerifyOTP = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      showCustomAlert(
        'Incomplete OTP',
        'Please enter complete 6-digit OTP',
        'warning'
      );
      return;
    }

    setLoading(true);
    const result = await verifyOTP(username, email, finalOtp);
    setLoading(false);

    if (result.success) {
      showCustomAlert(
        '🎉 Welcome!',
        'Login successful! Welcome to Blinkit',
        'success',
        () => {
          hideAlert();
          if (fromCheckout) {
            // Navigate to main app and directly to Cart's Address screen
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'HomeStack',
                  state: {
                    routes: [
                      {
                        name: 'Cart',
                        state: {
                          routes: [
                            { name: 'CartHome' },
                            { name: 'Address' }
                          ],
                          index: 1
                        }
                      }
                    ],
                    index: 2 // Cart is the 3rd tab (index 2)
                  }
                }
              ]
            });
          } else {
            // Default: go to main app (Home tab will be selected by default)
            navigation.reset({
              index: 0,
              routes: [{ name: 'HomeStack' }]
            });
          }
        }
      );
    } else {
      showCustomAlert(
        'Invalid OTP',
        result.error || 'Please check your OTP and try again',
        'error'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>Enter OTP sent to {email}</Text>

        {/* 6 OTP Boxes */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputs.current[index] = ref)}
              style={styles.otpBox}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              keyboardType="number-pad"
              maxLength={1}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerifyOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify OTP</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={alertConfig.visible}
        onClose={hideAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
        confirmText="OK"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#2E7D32",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },

  // OTP BOXES
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  otpBox: {
    width: 50,
    height: 55,
    backgroundColor: "#fff",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",

    borderWidth: 1,
    borderColor: "#D1D5DB",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },

  button: {
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  backText: {
    textAlign: "center",
    color: "#2E7D32",
    fontSize: 15,
    fontWeight: "bold",
  },
});
