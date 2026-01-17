import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import SweetAlert from '../utils/AlertManager';
import { AuthContext } from '../context/AuthContext';

const BASE_URL = 'https://grocery-backend-3pow.onrender.com';

export default function PersonalInfoScreen({ navigation }) {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [dob, setDob] = useState('');
	const [gender, setGender] = useState('');
	const [bio, setBio] = useState('');
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const { authToken, user } = useContext(AuthContext);

	// Fetch user profile on component mount
	useEffect(() => {
		fetchUserProfile();
	}, []);

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
			} else if (response.status === 404) {
				// Profile doesn't exist yet, use default values
				setEmail(user?.email || '');
				setName(user?.name || '');
			} else {
				console.error('Failed to fetch profile');
			}
		} catch (error) {
			console.error('Error fetching profile:', error);
		} finally {
			setLoading(false);
		}
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

			const profileData = {
				fullName: name,
				email: email,
				phoneNumber: phone,
				gender: gender,
				dateOfBirth: dob ? new Date(dob).toISOString() : null,
				bio: bio
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
								source={{ uri:'https://ui-avatars.com/api/?name=User&background=16A34A&color=fff' }}
								style={styles.avatar}
							/>
						</View>
						<TouchableOpacity style={styles.editAvatar}>
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
							onChangeText={setName}
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
							onChangeText={setEmail}
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
							onChangeText={setPhone}
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
							onChangeText={setDob}
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
							onChangeText={setGender}
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
							onChangeText={setBio}
							multiline
							numberOfLines={3}
						/>
					</View>
				</View>

				{/* Save Button */}
				<TouchableOpacity 
					style={[styles.saveBtn, saving && styles.saveBtnDisabled]} 
					onPress={onSave}
					disabled={saving}
				>
					{saving ? (
						<ActivityIndicator size="small" color="#fff" />
					) : (
						<Icon name="save-outline" size={20} color="#fff" />
					)}
					<Text style={styles.saveText}>
						{saving ? 'Saving...' : 'Save Changes'}
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

