import React, { useState, useEffect, useContext, useRef } from 'react';
import RNFetchBlob from 'rn-fetch-blob';
import { launchImageLibrary } from 'react-native-image-picker';
import { Platform, PermissionsAndroid } from 'react-native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import SweetAlert from '../utils/AlertManager';
import { AuthContext } from '../context/AuthContext';

// const BASE_URL = 'https://grocery-backend-3pow.onrender.com';


export default function PersonalInfoScreen({ navigation }) {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [dob, setDob] = useState('');
	const [gender, setGender] = useState('');
	const [bio, setBio] = useState('');
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [avatarUri, setAvatarUri] = useState(null);
	const [avatarUrl, setAvatarUrl] = useState(null); // URL from backend
	
	// Store original values to detect changes
	const originalValuesRef = useRef({});
	

	const { authToken, user } = useContext(AuthContext);

	// Image picker handler with permissions
	// Upload image to backend and get URL
	const uploadImageToBackend = async (uri) => {
		if (!uri || !authToken) return null;
		try {
			let filename = uri.split('/').pop();
			let formData = new FormData();
			formData.append('avatar', {
				uri,
				name: filename,
				type: 'image/jpeg',
			});
			const res = await fetch(`${BASE_URL}/api/profile/upload-avatar`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${authToken}`,
					'Content-Type': 'multipart/form-data',
				},
				body: formData,
			});
			const data = await res.json();
			if (res.ok && data.url) {
				setAvatarUrl(data.url);
				return data.url;
			}
			return null;
		} catch (e) {
			Alert.alert('Upload Failed', 'Could not upload image.');
			return null;
		}
	};

	const handlePickImage = async () => {
		try {
			if (Platform.OS === 'android') {
				let granted = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
					{
						title: 'Permission Required',
						message: 'App needs access to your photo library to select an image.',
						buttonNeutral: 'Ask Me Later',
						buttonNegative: 'Cancel',
						buttonPositive: 'OK',
					},
				);
				if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
					Alert.alert('Permission Denied', 'Cannot open gallery without permission.');
					return;
				}
			}
			launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, (response) => {
				if (response.didCancel) return;
				if (response.errorCode) {
					Alert.alert('Image Picker Error', response.errorMessage || 'Unknown error');
					return;
				}
				if (response.assets && response.assets.length > 0) {
					setAvatarUri(response.assets[0].uri);
					setHasUnsavedChanges(true);
				} else {
					Alert.alert('No Image Selected', 'Please select an image from your gallery.');
				}
			});
		} catch (err) {
			Alert.alert('Error', 'Failed to open gallery. Please try again.');
		}
	};

	// Fetch user profile on component mount
	useEffect(() => {
		fetchUserProfile();
	}, []);

	// Set up back button handler to check for unsaved changes
	useEffect(() => {
		const unsubscribe = navigation?.addListener('beforeRemove', (e) => {
			if (!hasUnsavedChanges) {
				return;
			}

			e.preventDefault();

			SweetAlert.showAlertWithOptions({
				title: 'Unsaved Changes',
				subTitle: 'You have unsaved changes. Do you want to discard them?',
				style: 'warning',
				confirmButtonTitle: 'Discard',
				cancelButtonTitle: 'Keep Editing',
				confirmButtonColor: '#EF4444'
			}, (isConfirmed) => {
				if (isConfirmed) {
					navigation?.dispatch(e.data.action);
				}
			});
		});

		return unsubscribe;
	}, [navigation, hasUnsavedChanges]);

	const fetchUserProfile = async () => {
		try {
			if (!authToken) {
				setLoading(false);
				return;
			}

			const response = await fetch(`${BASE_URL}/api/profile/my`, {
				headers: {
					'Authorization': `Bearer ${authToken}`,
					'Content-Type': 'application/json',
				},
			});

			if (response.ok) {
				const profileData = await response.json();
				// Populate form fields with existing data
				setName(profileData.fullName || '');
				setEmail(profileData.email || user?.email || '');
				setPhone(profileData.phoneNumber || '');
				setGender(profileData.gender || '');
				setBio(profileData.bio || '');
				// Format date if exists
				if (profileData.dateOfBirth) {
					const date = new Date(profileData.dateOfBirth);
					setDob(date.toISOString().split('T')[0]); // YYYY-MM-DD format
				}
				
				// Store original values to track changes
				originalValuesRef.current = {
					name: profileData.fullName || '',
					email: profileData.email || user?.email || '',
					phone: profileData.phoneNumber || '',
					gender: profileData.gender || '',
					dob: profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : '',
					bio: profileData.bio || '',
				};
				
				setHasUnsavedChanges(false);
			} else if (response.status === 404) {
				// Profile doesn't exist yet, use default values
				setEmail(user?.email || '');
				setName(user?.name || '');
				
				originalValuesRef.current = {
					name: user?.name || '',
					email: user?.email || '',
					phone: '',
					gender: '',
					dob: '',
					bio: '',
				};
				
				setHasUnsavedChanges(false);
			} else {
				console.error('Failed to fetch profile');
			}
		} catch (error) {
			console.error('Error fetching profile:', error);
		} finally {
			setLoading(false);
		}
	};

	// Check for unsaved changes whenever user edits
	const checkForChanges = (newValues) => {
		const hasChanges = Object.keys(newValues).some(
			key => newValues[key] !== originalValuesRef.current[key]
		);
		setHasUnsavedChanges(hasChanges);
	};

	// Handlers for each field with change detection
	const handleNameChange = (text) => {
		setName(text);
		checkForChanges({
			name: text,
			email,
			phone,
			gender,
			dob,
			bio,
		});
	};

	const handleEmailChange = (text) => {
		setEmail(text);
		checkForChanges({
			name,
			email: text,
			phone,
			gender,
			dob,
			bio,
		});
	};

	const handlePhoneChange = (text) => {
		setPhone(text);
		checkForChanges({
			name,
			email,
			phone: text,
			gender,
			dob,
			bio,
		});
	};

	const handleDobChange = (text) => {
		setDob(text);
		checkForChanges({
			name,
			email,
			phone,
			gender,
			dob: text,
			bio,
		});
	};

	const handleGenderChange = (text) => {
		setGender(text);
		checkForChanges({
			name,
			email,
			phone,
			gender: text,
			dob,
			bio,
		});
	};

	const handleBioChange = (text) => {
		setBio(text);
		checkForChanges({
			name,
			email,
			phone,
			gender,
			dob,
			bio: text,
		});
	};

	const onSave = async () => {
		// Validation
		if (!name || !email) {
			SweetAlert.showAlertWithOptions({
				title: 'Missing Information',
				subTitle: 'Please fill at least name and email.',
				style: 'warning',
				confirmButtonTitle: 'OK',
				confirmButtonColor: '#F59E0B'
			});
			return;
		}

		setSaving(true);

		try {
			if (!authToken) {
				SweetAlert.showAlertWithOptions({
					title: 'Authentication Error',
					subTitle: 'Please login again to save your profile.',
					style: 'error',
					confirmButtonTitle: 'OK',
					confirmButtonColor: '#EF4444'
				});
				return;
			}


			let uploadedAvatarUrl = avatarUrl;
			if (avatarUri && !avatarUrl) {
				uploadedAvatarUrl = await uploadImageToBackend(avatarUri);
			}

			const profileData = {
				fullName: name,
				email: email,
				phoneNumber: phone,
				gender: gender,
				dateOfBirth: dob ? new Date(dob).toISOString() : null,
				bio: bio,
				avatar: uploadedAvatarUrl || undefined
			};

			const response = await fetch(`${BASE_URL}/api/profile`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${authToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(profileData),
			});

			const result = await response.json();

			if (response.ok) {
				SweetAlert.showAlertWithOptions({
					title: 'Saved!',
					subTitle: 'Your personal information has been updated.',
					style: 'success',
					confirmButtonTitle: 'Great!',
					confirmButtonColor: '#16A34A'
				}, () => {
					navigation?.goBack?.();
				});
			} else {
				SweetAlert.showAlertWithOptions({
					title: 'Save Failed',
					subTitle: result.message || 'Failed to save profile. Please try again.',
					style: 'error',
					confirmButtonTitle: 'OK',
					confirmButtonColor: '#EF4444'
				});
			}
		} catch (error) {
			console.error('Error saving profile:', error);
			SweetAlert.showAlertWithOptions({
				title: 'Save Failed',
				subTitle: 'Network error. Please check your connection and try again.',
				style: 'error',
				confirmButtonTitle: 'OK',
				confirmButtonColor: '#EF4444'
			});
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#16A34A" />
					<Text style={styles.loadingText}>Loading profile...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView contentContainerStyle={styles.content}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
						<Icon name="chevron-back" size={26} color="#111827" />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Personal Information</Text>
					<View style={{ width: 26 }} />
				</View>

				{/* Profile Card */}
				<View style={styles.card}>
					<View style={styles.avatarContainer}>
						<View style={styles.avatarCircle}>
							<Image
								source={avatarUri ? { uri: avatarUri } : avatarUrl ? { uri: avatarUrl } : { uri: 'https://ui-avatars.com/api/?name=User&background=16A34A&color=fff' }}
								style={styles.avatar}
							/>
						</View>
						<TouchableOpacity style={styles.editAvatar} onPress={handlePickImage}>
							<Icon name="camera" size={18} color="#fff" />
						</TouchableOpacity>
					</View>
					<Text style={styles.cardSubtitle}>Keep your details up to date</Text>
				</View>

				{/* Form */}
				<View style={styles.formSection}>
					{/* Name */}
					<View style={styles.inputRow}>
						<Icon name="person-outline" size={20} color="#6B7280" />
						<TextInput
							style={styles.input}
							placeholder="Full Name"
							placeholderTextColor="#9CA3AF"
							value={name}
						onChangeText={handleNameChange}
						/>
					</View>

					{/* Email */}
					<View style={styles.inputRow}>
						<Icon name="mail-outline" size={20} color="#6B7280" />
						<TextInput
							style={styles.input}
							placeholder="Email"
							placeholderTextColor="#9CA3AF"
							keyboardType="email-address"
							autoCapitalize="none"
							value={email}
						onChangeText={handleEmailChange}
						/>
					</View>

					{/* Phone */}
					<View style={styles.inputRow}>
						<Icon name="call-outline" size={20} color="#6B7280" />
						<TextInput
							style={styles.input}
							placeholder="Phone"
							placeholderTextColor="#9CA3AF"
							keyboardType="phone-pad"
							value={phone}
						onChangeText={handlePhoneChange}
						/>
					</View>

					{/* DOB */}
					<View style={styles.inputRow}>
						<Icon name="calendar-clear-outline" size={20} color="#6B7280" />
						<TextInput
							style={styles.input}
							placeholder="Date of Birth (YYYY-MM-DD)"
							placeholderTextColor="#9CA3AF"
							value={dob}
						onChangeText={handleDobChange}
						/>
					</View>

					{/* Gender */}
					<View style={styles.inputRow}>
						<Icon name="male-female-outline" size={20} color="#6B7280" />
						<TextInput
							style={styles.input}
							placeholder="Gender (Male/Female/Other)"
							placeholderTextColor="#9CA3AF"
							value={gender}
						onChangeText={handleGenderChange}
						/>
					</View>

					{/* Bio */}
					<View style={[styles.inputRow, { alignItems: 'flex-start' }]}>
						<Icon name="document-text-outline" size={20} color="#6B7280" style={{ marginTop: 12 }} />
						<TextInput
							style={[styles.input, styles.multiline]}
							placeholder="Bio (Tell us about yourself)"
							placeholderTextColor="#9CA3AF"
							value={bio}
							onChangeText={handleBioChange}
							multiline
							numberOfLines={3}
						/>
					</View>
				</View>

				{/* Save Button */}
				<TouchableOpacity 
				style={[styles.saveBtn, (saving || !hasUnsavedChanges) && styles.saveBtnDisabled]} 
				onPress={onSave}
				disabled={saving || !hasUnsavedChanges}
				>
					{saving ? (
						<ActivityIndicator size="small" color="#fff" />
					) : (
						<Icon name="save-outline" size={20} color="#fff" />
					)}
					<Text style={styles.saveText}>
					{saving ? 'Saving...' : 'Save Changes'} {hasUnsavedChanges && '*'}
					</Text>
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F0FDF4',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: '#6B7280',
		textAlign: 'center',
	},
	content: {
		paddingBottom: 24,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: '#FEFFFE',
		borderBottomWidth: 1,
		borderColor: '#D1FAE5',
	},
	backBtn: {
		width: 36,
		height: 36,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#111827',
	},
	card: {
		margin: 16,
		backgroundColor: '#FEFFFE',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#D1FAE5',
		padding: 16,
	},
	avatarContainer: {
		alignSelf: 'center',
		marginBottom: 10,
	},
	avatarCircle: {
		width: 84,
		height: 84,
		borderRadius: 42,
		overflow: 'hidden',
		borderWidth: 2,
		borderColor: '#16A34A',
	},
	avatar: {
		width: '100%',
		height: '100%',
	},
	editAvatar: {
		position: 'absolute',
		right: -4,
		bottom: -4,
		backgroundColor: '#16A34A',
		borderRadius: 16,
		padding: 8,
		elevation: 2,
	},
	cardSubtitle: {
		textAlign: 'center',
		color: '#6B7280',
		marginTop: 8,
	},
	formSection: {
		marginHorizontal: 16,
		marginBottom: 12,
		backgroundColor: '#FEFFFE',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#D1FAE5',
		padding: 12,
	},
	inputRow: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#D1FAE5',
		borderRadius: 10,
		paddingHorizontal: 12,
		backgroundColor: '#ECFDF5',
		marginBottom: 12,
	},
	input: {
		flex: 1,
		paddingVertical: 12,
		paddingHorizontal: 10,
		fontSize: 15,
		color: '#111827',
	},
	multiline: {
		minHeight: 90,
		textAlignVertical: 'top',
	},
	saveBtn: {
		marginHorizontal: 16,
		marginTop: 6,
		backgroundColor: '#16A34A',
		borderRadius: 12,
		paddingVertical: 14,
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 8,
	},
	saveBtnDisabled: {
		backgroundColor: '#9CA3AF',
	},
	saveText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
		marginLeft: 8,
	},
});

