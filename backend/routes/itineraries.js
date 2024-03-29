const express = require("express");
const router = express.Router();

// Import the Firebase Admin SDK instance
const admin = require("firebase-admin");

// Get a reference to the Firestore database
const db = admin.firestore();

// Define your route handler
router.post("/create", async (req, res) => {
  try {
    const data = req.body; // Adjusted for clarity
    // console.log(data);

    // Check for required fields more thoroughly
    if (!data || !data.events || !data.restaurant || !data.hotel) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Define a default imageURL
    const defaultImageURL = "www.random.com";

    // Process and add each event
    const eventPromises = data.events.map((event) =>
      db
        .collection("events")
        .doc(event.id)
        .set({
          ...event,
          ratingEvent: parseFloat(event.ratingEvent),
          // imageURL: event.imageURL || defaultImageURL,
        })
    );

    // Process and add each restaurant
    const restaurantPromises = data.restaurant.map((restaurant) =>
      db
        .collection("restaurants")
        .doc(restaurant.id)
        .set({
          ...restaurant,
          ratingRestaurant: parseFloat(restaurant.ratingRestaurant),
          priceRestaurant: parseFloat(restaurant.priceRestaurant), // Ensure this is a number
          // imageURL: restaurant.imageURL || defaultImageURL, // Apply a default image URL if none is provided
          // No need to repeat the setting of fields already contained in ...restaurant
        })
    );

    // Add the hotel
    const hotelId = data.hotel.id;
    await db
      .collection("hotels")
      .doc(hotelId)
      .set({
        ...data.hotel,
        ratingHotel: parseFloat(data.hotel.ratingHotel),
        // imageURL: data.hotel.imageURL || defaultImageURL,
      });

    // Wait for all events and restaurants to be added
    await Promise.all([...eventPromises, ...restaurantPromises]);

    // Construct the itinerary object
    const itinerary = {
      userId: data.userId,
      userPhoto: data.photoURL,
      likeCount: 0,
      commentCount: 0,
      name: data.name,
      city: data.city,
      date: data.date,
      events: data.events.map((event) => ({
        eventID: db.doc(`/events/${event.id}`),
        time: event.time,
        typeOfActivity: event.typeOfActivity,
        locationEvent: event.locationEvent,
        priceEvent: parseFloat(event.priceEvent),
        rating: event.ratingEvent,
        event: event.event,
        // imageURL: event.imageURL || defaultImageURL,
      })),
      restaurants: data.restaurant.map((restaurant) => ({
        restaurantID: db.doc(`/restaurants/${restaurant.id}`),
        time: restaurant.time,
        cuisine: restaurant.cuisine,
        locationRestaurant: restaurant.locationRestaurant,
        priceRestaurant: parseFloat(restaurant.priceRestaurant),
        restaurant: restaurant.restaurant,
        rating: restaurant.ratingRestaurant,
        // imageURL: restaurant.imageURL || defaultImageURL,
      })),
      hotel: {
        hotel: data.hotel.hotel,
        rating: data.hotel.ratingHotel,
        hotelID: db.doc(`/hotels/${hotelId}`),
        time: data.hotel.time,
        locationHotel: data.hotel.locationHotel,
        priceHotel: parseFloat(data.hotel.priceHotel),
        bookingURL: data.hotel.bookingURL,
        // imageURL: data.hotel.imageURL || defaultImageURL,
      },
      images: data.images || [],
      totalPrice: data.totalPrice,
    };
    // console.log("\n\n itinerary \n", itinerary);
    // Add the itinerary to the 'itineraries' collection
    const itineraryRef = await db.collection("itineraries").add(itinerary);

    // console.log("Itinerary created successfully with ID:", itineraryRef.id);
    res
      .status(201)
      .json({ message: "Itinerary created successfully", id: itineraryRef.id });
  } catch (error) {
    console.error("Error creating itinerary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//  price: data.price, // Assuming price is part of the data
//rating: parseFloat(data.rating), // Assuming rating is part of the data
router.get("/all", async (req, res) => {
  try {
    const userId = req.query.userId;

    // Initialize itineraries array
    let itineraries = [];

    // Check if userId is provided
    if (userId) {
      // Fetch the user's liked itineraries if userId is provided
      const userDoc = await db.collection("users").doc(userId).get();
      const likedItineraries = userDoc.data().likedItineraries || [];

      // Fetch all itineraries
      const itinerariesSnapshot = await db.collection("itineraries").get();
      itineraries = itinerariesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isLiked: likedItineraries.includes(doc.id), // Mark itineraries as liked if they are in user's liked list
      }));
    } else {
      // Fetch all itineraries without checking for likes, if userId is not provided
      const itinerariesSnapshot = await db.collection("itineraries").get();
      itineraries = itinerariesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isLiked: false, // Initialize all as not liked
      }));
    }

    // Return the itineraries
    res.status(200).json(itineraries);
  } catch (error) {
    console.error("Error fetching all itineraries:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// router.get("/all", async (req, res) => {
//   try {
//     const itinerariesSnapshot = await db.collection("itineraries").get();
//     const itineraries = itinerariesSnapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));
//     console.log("\n\n", itineraries);
//     res.status(200).json(itineraries);
//   } catch (error) {
//     console.error("Error fetching all itineraries:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

router.get("/followed-itineraries/:userId", async (req, res) => {
  try {
    // The userId parameter comes from the URL
    const { userId } = req.params;

    // Fetch the user document to get the 'following' list
    const userRef = db.collection("users").doc(userId);
    const userSnapshot = await userRef.get();
    const likedItineraries = userSnapshot.data().likedItineraries || [];
    if (!userSnapshot.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get the 'following' list from the user document
    const userFollowing = userSnapshot.data().following || [];
    const myId = userFollowing && userFollowing.userId;
    // Query itineraries created by users that the current user is following
    const itinerariesPromises = userFollowing.map(async (followedUserId) => {
      // console.log("id=", followedUserId.userId);
      const itinerariesSnapshot = await db
        .collection("itineraries")
        .where("userId", "==", followedUserId.userId)
        .get();

      return itinerariesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isLiked: likedItineraries.includes(doc.id),
      }));
    });
    // Wait for all the promises to resolve
    const itinerariesResults = await Promise.all(itinerariesPromises);
    // console.log("result", itinerariesResults);

    // Flatten the array of arrays into a single array of itineraries
    const followedItineraries = itinerariesResults.flat();

    // Respond with the fetched itineraries
    res.status(200).json(followedItineraries);
  } catch (error) {
    console.error("Error fetching followed itineraries:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Increment the like count for a specific itinerary
router.post("/increment-like/:id", async (req, res) => {
  // console.log(`Incrementing like for ID: ${req.params.id}`);
  try {
    const id = req.params.id;
    const itineraryRef = db.collection("itineraries").doc(id);

    // Atomically increment the like count
    await itineraryRef.update({
      likeCount: admin.firestore.FieldValue.increment(1),
    });

    res.status(200).json({ message: "Like count incremented successfully" });
  } catch (error) {
    console.error("Error incrementing like count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/decrement-like/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const itineraryRef = db.collection("itineraries").doc(id);

    // Atomically decrement the like count
    await itineraryRef.update({
      likeCount: admin.firestore.FieldValue.increment(-1),
    });

    res.status(200).json({ message: "Like count decremented successfully" });
  } catch (error) {
    console.error("Error decrementing like count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//Search for itineraries that include a specific location
router.get("/", async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ error: "City parameter is required" });
    }

    // Query itineraries that include the specified city
    const itinerariesSnapshot = await db
      .collection("itineraries")
      .where("city", "==", city)
      .get();
    const itineraries = itinerariesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(itineraries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch data from Firestore
    const itineraryRef = db.collection("itineraries").doc(id);
    const itinerarySnapshot = await itineraryRef.get();
    const itineraryData = itinerarySnapshot.data();

    // Replace hotel reference with actual hotel data
    if (itineraryData.hotel && itineraryData.hotel.hotelid) {
      const hotelRef = itineraryData.hotel.hotelid;
      const hotelSnapshot = await hotelRef.get();
      itineraryData.hotel = hotelSnapshot.data();
    }

    // Replace event references with actual event data
    if (itineraryData.event && itineraryData.event.length > 0) {
      const eventPromises = itineraryData.event.map(async (event) => {
        const eventRef = event.eventID;
        const eventSnapshot = await eventRef.get();
        return eventSnapshot.data();
      });
      itineraryData.event = await Promise.all(eventPromises);
    }

    // Replace restaurant references with actual restaurant data
    if (itineraryData.restaurant && itineraryData.restaurant.length > 0) {
      const restaurantPromises = itineraryData.restaurant.map(
        async (restaurant) => {
          const restaurantRef = restaurant.restaurantID;
          const restaurantSnapshot = await restaurantRef.get();
          return restaurantSnapshot.data();
        }
      );
      itineraryData.restaurant = await Promise.all(restaurantPromises);
    }

    // Respond with the fetched itinerary data
    res.json(itineraryData);
  } catch (error) {
    console.error("Error fetching itinerary data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/:id/comments", async (req, res) => {
  try {
    const { id } = req.params; // Itinerary ID
    const { userId, text } = req.body; // Comment details from request body

    if (!userId || !text) {
      return res.status(400).json({ error: "Missing comment details" });
    }

    const comment = {
      userId,
      text,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      itineraryRef: db.doc(`itineraries/${id}`), // Add a reference to the itinerary
      likeCount: 0,
    };

    const commentRef = await db.collection("comments").add(comment);
    // console.log("Comment added successfully with ID:", commentRef.id);

    // Update comment count in the corresponding itinerary
    const itineraryRef = db.collection("itineraries").doc(id);
    await itineraryRef.update({
      commentCount: admin.firestore.FieldValue.increment(1), // Increment comment count by 1
    });

    // Fetch the newly added comment from the database
    const newCommentSnapshot = await commentRef.get();
    const newCommentData = newCommentSnapshot.data();

    // Return the newly added comment in the response
    res.status(201).json(newCommentData);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/comments/:commentId/like/increment", async (req, res) => {
  try {
    const { commentId } = req.params; //comment ID
    const commentRef = db.collection("comments").doc(commentId);

    // Atomically increment the like count
    await commentRef.update({
      likeCount: admin.firestore.FieldValue.increment(1),
    });

    res.status(200).json({ message: "Like count incremented successfully" });
  } catch (error) {
    console.error("Error incrementing like count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/user/:username", async (req, res) => {
  try {
    const username = req.params.username;

    // Fetch the user document to get the user's ID
    const userRef = db.collection("users").where("username", "==", username);
    const userSnapshot = await userRef.get();

    if (userSnapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userSnapshot.docs[0].id;

    // Query itineraries created by the specified user
    const itinerariesSnapshot = await db
      .collection("itineraries")
      .where("userId", "==", userId)
      .get();
    const itineraries = itinerariesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get the saved itineraries for the user
    const userSavedItineraries =
      userSnapshot.docs[0].data().savedItineraries || [];
    const savedItinerariesPromises = userSavedItineraries.map(
      async (itineraryId) => {
        const itineraryRef = db.collection("itineraries").doc(itineraryId);
        const itinerarySnapshot = await itineraryRef.get();
        return { id: itinerarySnapshot.id, ...itinerarySnapshot.data() };
      }
    );
    // Wait for all promises to resolve
    const savedItineraries = await Promise.all(savedItinerariesPromises);

    // Get the liked itineraries for the user
    const userLikedItineraries =
      userSnapshot.docs[0].data().likedItineraries || [];
    const likedItinerariesPromises = userLikedItineraries.map(
      async (itineraryId) => {
        const itineraryRef = db.collection("itineraries").doc(itineraryId);
        const itinerarySnapshot = await itineraryRef.get();
        return { id: itinerarySnapshot.id, ...itinerarySnapshot.data() };
      }
    );
    // Wait for all promises to resolve
    const likedItineraries = await Promise.all(likedItinerariesPromises);

    // Respond with the fetched itineraries
    res.status(200).json({
      posted: itineraries,
      saved: savedItineraries,
      liked: likedItineraries,
    });
  } catch (error) {
    console.error("Error fetching user itineraries:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/users/:userId/save-itinerary", async (req, res) => {
  try {
    const { userId } = req.params;
    const { itineraryId } = req.body;

    if (!itineraryId) {
      return res.status(400).json({ error: "Missing itinerary ID" });
    }

    // Reference to the user's document in the 'users' collection
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Atomically add the itinerary ID to the 'savedItineraries' array field in the user's document
    await userRef.update({
      savedItineraries: admin.firestore.FieldValue.arrayUnion(itineraryId),
    });

    res.status(200).json({ message: "Itinerary saved successfully" });
  } catch (error) {
    console.error("Error saving itinerary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/users/:userId/remove-saved-itinerary", async (req, res) => {
  const { userId } = req.params; // Extract userId from URL parameters
  const { itineraryId } = req.body; // Extract itineraryId from request body

  try {
    // Reference to the user's document in the 'users' collection
    const userRef = db.collection("users").doc(userId);
    // Fetch the document to check if the user exists
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // If the user document does not exist, return a 404 error
      console.log(`User not found with ID: ${userId}`);
      return res.status(404).json({ error: "User not found" });
    }

    // Atomically remove the itinerary ID from the 'savedItineraries' array field
    await userRef.update({
      savedItineraries: admin.firestore.FieldValue.arrayRemove(itineraryId),
    });

    console.log(
      `Itinerary ID ${itineraryId} removed from user ID ${userId}'s saved itineraries`
    );
    res.json({
      message: "Itinerary removed successfully from saved itineraries",
    });
  } catch (error) {
    console.error(
      `Error removing saved itinerary for user ID ${userId}: ${error.message}`
    );
    res.status(500).json({
      message:
        error.message ||
        "Error Occurred while removing itinerary from saved itineraries",
    });
  }
});

router.post("/comments/:commentId/like/decrement", async (req, res) => {
  try {
    const { commentId } = req.params; // comment ID
    const commentRef = db.collection("comments").doc(commentId);

    // Atomically decrement the like count
    await commentRef.update({
      likeCount: admin.firestore.FieldValue.increment(-1),
    });

    res.status(200).json({ message: "Like count decremented successfully" });
  } catch (error) {
    console.error("Error decrementing like count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id/comments", async (req, res) => {
  // #TODO: Add fetching users and add it to the comments array
  try {
    const { id } = req.params; // Itinerary ID
    const commentsSnapshot = await db
      .collection("comments")
      .where("itineraryRef", "==", db.doc(`itineraries/${id}`))
      .orderBy("likeCount", "desc")
      .get();
    const comments = commentsSnapshot.docs.map((doc) => {
      const commentData = doc.data();
      commentData.id = doc.ref.id; // Add commentRef to commentData
      return commentData;
    });
    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
//test
