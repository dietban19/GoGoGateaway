import React, { createContext, useState, useEffect, useContext } from 'react';

import { useParams } from 'react-router-dom';
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  getAdditionalUserInfo,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import {
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

// Create a context for managing user information
export const UserContext = React.createContext();

const provider = new GoogleAuthProvider();

// Custom hook to access the UserContext
export function useUserContext() {
  return useContext(UserContext);
}

// Provider component to wrap the application and provide user context
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // State for storing the current user
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuthState, setLoadingAuthState] = useState(true); // State to track loading of auth state
  const navigate = useNavigate(); // Hook for navigating between routes
  const [isNewGoogleUser, setIsNewGoogleUser] = useState(false);
  const [signPopup, setSignPopup] = useState(false);
  const [error, setError] = useState(null);
  /* if a user signs in through google, and their google account is a new user,  it will add to the firebase database*/
  async function addNewGoogleUser(result) {
    // Assuming result.user contains photoURL after Google sign-in
    const photoURL = result.user.photoURL || ''; // Fallback to empty string if undefined
    const addUserData = {
      username: result.user.email.split('@')[0],
      id: result.user.uid,
      email: result.user.email,
      photoURL: photoURL, // Use the photoURL from Google
      loggedIn: true,
      firstName: '',
      lastName: '',
      age: '',
      admin: false,
      googleUser: true,
    };
    console.log('user Data', addUserData);
    const userDocRef = doc(db, 'users', result.user.uid);
    await setDoc(userDocRef, addUserData);
  }

  /* Same as addNewGoogleUser, but for email and password input */
  async function addNewEmailUser(result) {
    console.log(result);
    console.log('adding new');
    console.log(4, result.email);
    const username = result.email.split('@')[0];
    try {
      // Constructing the user data to be saved in Firestore
      const userData = {
        username: username,
        id: result.userId,
        email: result.email,
        photoURL: '',
        loggedIn: true,
        firstName: result.firstName,
        lastName: result.lastName,
        // age: result.age,
        admin: false,
        googleUser: false,
      };

      // Reference to the user's document in Firestore
      // Assuming you have a 'users' collection in Firestore
      const userDocRef = doc(db, 'users', result.userId);

      // Adding the user data to Firestore
      await setDoc(userDocRef, userData);

      console.log('User added to Firestore:', userData);
      // You can perform additional actions here, like redirecting the user
    } catch (error) {
      console.error('Error adding user to Firestore:', error);
      // Handle any errors here, like updating the UI to inform the user
    }
  }

  // Function to handle Google sign-in
  const googleSignIn = async () => {
    setLoadingAuthState(true);
    try {
      const result = await signInWithPopup(auth, provider);
      addOrUpdateGoogleUser(result);
      const userData = getAdditionalUserInfo(result);
      // Check if the user is signing in for the first time
      if (userData && userData.isNewUser) {
        console.log('new user', result);
        setIsNewGoogleUser(true);
        addNewGoogleUser(result);
      }

      setTimeout(() => {
        setLoadingAuthState(false);
      }, 2000); // 1000 milliseconds delay
      if (userData.isNewUser) {
        // navigate('/details');
      } else {
        // navigate('/dashboard');
      }
      // navigate('/');
      // now we are just using a poppup, so instead we just set popup to false
      setSignPopup(false);
    } catch (error) {
      console.log('error');
      console.log(error.message);
    }
  };

  async function addOrUpdateGoogleUser(result) {
    const userDataFromGoogle = {
      username: result.user.email.split('@')[0],
      id: result.user.uid,
      email: result.user.email,
      photoURL: result.user.photoURL || '', // Capture the photoURL from Google sign-in
      loggedIn: true,
      firstName: result.user.displayName?.split(' ')[0] || '', // Optional: Capture first name from displayName
      lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '', // Optional: Capture last name from displayName
      googleUser: true,
      // Include any other user fields you want to capture or update
    };

    const userDocRef = doc(db, 'users', result.user.uid);

    // Use setDoc with { merge: true } to update the existing document or create a new one without overwriting other fields
    await setDoc(userDocRef, userDataFromGoogle, { merge: true });
  }

  // function for logout
  const logout = async () => {
    // Show a confirmation dialog
    const confirmLogout = window.confirm('Are you sure you want to log out?');

    if (confirmLogout) {
      setLoadingAuthState(true);
      try {
        await signOut(auth); // Sign out the user
        setTimeout(() => {
          setLoadingAuthState(false);
        }, 3000); // Delay for better user experience
        // navigate("/signup"); // Navigate to login or another appropriate route after logout
      } catch (error) {
        console.error('Error signing out: ', error);
      }
      navigate('/foryou');
    } else {
      // User clicked 'Cancel', so do nothing
      console.log('Logout canceled');
    }
  };
  const emailSignUp = async (userDetails) => {
    console.log('signup');
    console.log(userDetails);
    // Check if email already exists in Firestore
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(
      query(usersRef, where('email', '==', userDetails.email)),
    );
    console.log(2);
    if (!querySnapshot.empty) {
      // Handle case where email already exists
      toast({
        title: 'Error',
        description: 'Email already exists.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
      return;
    }
    console.log(3);
    createUserWithEmailAndPassword(
      auth,
      userDetails.email,
      userDetails.password,
    )
      .then((userCredential) => {
        // Signed up
        console.log(4);
        const user = userCredential.user;
        const userId = user.uid;
        console.log(user);
        // You can now use the userId for further operations, like adding the user to your database
        console.log(3);
        const data = {
          ...userDetails,
          userId: userId,
        };
        addNewEmailUser(data);
      })
      .catch((error) => {
        console.log(error.message);
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });
    // navigate('/');
    setSignPopup(false); //close signup popup
  };

  const emailSignIn = async (email, password) => {
    console.log('signing in');
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      // Signed in
      const user = userCredential.user;

      // ... other logic here
    } catch (error) {
      console.error('Error during sign-in:', error);
      // Re-throw the error to be caught by the caller
      throw error;
    }
    // navigate('/');
    // close popup
    setSignPopup(false);
  };

  // useEffect hook to monitor authentication state changes.
  // When an auth state change is detected, it performs checks and sets the details of user to 'user'
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setLoadingAuthState(true); // Indicate that loading of auth state has begun
      try {
        if (authUser) {
          // User is signed in
          setUser(authUser); // Set the global user state to the authenticated user
          const userDocRef = doc(db, 'users', authUser.uid); // Reference to the Firestore document
          const docSnapshot = await getDoc(userDocRef); // Fetch the document

          // Check if the Firestore document exists
          if (docSnapshot.exists()) {
            // Document exists, set currentUser to the document data
            setCurrentUser(docSnapshot.data());
          } else {
            // Document does not exist, handle this case (e.g., user authenticated but not in Firestore)
            setCurrentUser(null);
          }
        } else {
          // No user is signed in
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Error during authentication state change:', err);
      } finally {
        setLoadingAuthState(false); // Indicate that loading of auth state is complete
      }
    });

    // Cleanup function to unsubscribe from the auth state listener when the component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array means this effect runs once on mount

  const updateUser = async (updatedUserDetails) => {
    if (!user) {
      console.error('No user is signed in');
      return;
    }
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, updatedUserDetails, { merge: true });
      console.log('User updated successfully');
    } catch (error) {
      console.error('Error updating user: ', error);
    }
  };

  const values = {
    user,
    currentUser,
    loadingAuthState,
    setLoadingAuthState,
    googleSignIn,
    logout,
    emailSignUp,
    emailSignIn,
    updateUser,
    signPopup,
    setSignPopup,
  };

  // Provider component wrapping children with the user context
  return <UserContext.Provider value={values}>{children}</UserContext.Provider>;
};
