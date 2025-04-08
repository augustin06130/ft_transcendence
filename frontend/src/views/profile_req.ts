import { isLogged } from "@framework/auth";

// Type pour les données utilisateur
interface UserProfile {
  username: string;
  email: string;
  phone: string;
  bio: string;
  profilePicture: string;
}

// Fonction pour récupérer le profil utilisateur
export async function fetchUserProfile() {
  if (!isLogged.get()) {
    throw new Error("User not authenticated");
  }

  const response = await fetch('/GetUser', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.success || !data.userData) {
    throw new Error('Invalid response format');
  }

  return data.userData as UserProfile;
}

// Fonction pour mettre à jour le profil
export async function updateUserProfile(profileData: Partial<UserProfile> & { profilePictureFile?: File }) {
  if (!isLogged.get()) {
    throw new Error("User not authenticated");
  }

  const formData = new FormData();
  
  // Ajoute les champs standards
  if (profileData.email) formData.append('email', profileData.email);
  if (profileData.phone) formData.append('phone', profileData.phone);
  if (profileData.bio) formData.append('bio', profileData.bio);
  
  // Gère l'upload de l'image si présente
  if (profileData.profilePictureFile) {
    formData.append('profilePicture', profileData.profilePictureFile);
  } else if (profileData.profilePicture?.startsWith('http')) {
    formData.append('profilePictureUrl', profileData.profilePicture);
  }

  const response = await fetch('/Profile', {
    method: 'POST',
    credentials: 'include',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}