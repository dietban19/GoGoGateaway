import React, { useState } from 'react';
import { useUserContext } from '../context/userContext';
import { CgProfile } from 'react-icons/cg';
const ProfilePicture = () => {
  const { user, currentUser } = useUserContext();
  console.log(user);
  const isGoogleUser = currentUser.googleUser;
  const [imageError, setImageError] = useState(false); // State to track image loading error
  // Extract the first letter of currentUser's email if needed
  const firstLetter = currentUser.email ? currentUser.email[0] : '';
  const fallbackImage = 'path_to_your_fallback_image.png';
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div>
      {isGoogleUser && !imageError ? (
        // If a Google user and no image error, display the profile image
        <img
          src={currentUser.photoURL}
          onError={handleImageError}
          alt="Profile"
          className="w-12 rounded-full"
        />
      ) : // If not a Google user or there is an image error, display either the first letter of the email or an icon
      imageError || !firstLetter ? (
        <CgProfile className="h-10 w-10" /> // React icon used when there's an error or no first letter
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-400 text-lg font-semibold text-white">
          {firstLetter.toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default ProfilePicture;
