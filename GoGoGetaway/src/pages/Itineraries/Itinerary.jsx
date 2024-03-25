/*
 * Itineraries file
 * Gives us a page of old itineraries for a specific city that user can save
 */


import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import dumdum from '../../dummyData/dumdum.json';
import ItineraryComments from './ItineraryComments';

// import itinerary from '../../dummyData/dumdum.json';
import itinerariesDummy from '../../dummyData/dummyItinerary.json';
import axios from 'axios';

//imports for picture slideshow
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';

export default function Itinerary() {
  const location = useLocation();
  const [itinerary, setItinerary] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [events, setEvents] = useState([]);
  const [showComments, setShowComments] = useState(false); 

  // Function to toggle comments visibility
  const toggleComments = () => {
    setShowComments(!showComments);
  };


  useEffect(() => {
    const fetchItinerary = async () => {
      const queryParams = new URLSearchParams(location.search);
      
      const id = queryParams.get('id');
      console.log(id);
       


      try {
        // Update the URL to point to your backend API endpoint
        const response = await axios.get(
          `http://localhost:8080/itineraries/${id}`,
        );
        setItinerary(response.data);
      } catch (error) {
        const matchedItinerary = itinerariesDummy.find(
          (itin) => itin.id === id,
        );
        if (matchedItinerary) {
          setItinerary(matchedItinerary);
        }
        console.error('Error fetching itinerary:', error);
        // Handle error or set some state to show an error message
      }
    };

    if (location.search) {
      fetchItinerary();
    }
  }, [location]);

  console.log(itinerary);
  if (!itinerary) {
    return <div className="px-32">No itinerary found.</div>;
  }
  const formattedDate = new Date(itinerary.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });


  //*******************************************************************************
  //PAGE STARTS HERE with components added
  return (
    <>
      <div className="px-40 py-8">
        <div className="text-4xl font-bold">{itinerary.name}</div>
        <div className="p-4">
          {/* INSERT image slideshow */}
          <Slide>
            {itinerary.images.map((image, index) => (
              <div className="flex items-center justify-center bg-cover h-96" style={{ backgroundImage: `url(${image})` }} key={index}></div>
            ))}
          </Slide>
          
          {/* DETAILS */}
          <h1 className="mb-4 mt-7 text-3xl font-bold">Itinerary Details</h1>
  
          <div className="flex justify-center mb-4">
            <div className="border-2 border-black rounded-lg p-4 w-full bg-gray-200"> 
              <h2 className="text-xl mb-5 font-semibold">General Information</h2>
              <p>
                <strong>Date:</strong> {new Date(itinerary.date).toLocaleString()}
              </p>
              <p>
                <strong>City:</strong> {itinerary.city}
              </p>
              <p>
                <strong>Total Price:</strong> ${itinerary.totalPrice}
              </p>
              <p>
                <strong>Like Count:</strong> {itinerary.likeCount}
              </p>
              <p>
                <strong>Comment Count:</strong> {itinerary.commentCount}
              </p>
              <button onClick={toggleComments} className="comment-button">
                {showComments ? 'Hide Comments' : 'Show Comments'}
              </button>
              {showComments && <ItineraryComments itineraryId={itinerary.id} />}
            </div>
          </div>
  
          {/* Gray line divider */}
          <hr className="border-gray-400 w-full mb-4" />
  
          {/* Restaurants section */}
          <div className="mb-4">
            <h2 className="text-2xl mb-5 font-semibold">Restaurants &#127869;</h2>
            {itinerary.restaurants.map((restaurant, index) => (
              <div key={index} className="mb-2">
                <p>
                  <strong>Location:</strong> {restaurant.locationRestaurant}
                </p>
                <p>
                  <strong>Cuisine:</strong> {restaurant.cuisine}
                </p>
                <p>
                  <strong>Time:</strong> {restaurant.time}
                </p>
                <p>
                  <strong>Price:</strong> ${restaurant.priceRestaurant}
                </p>
                {/* Displaying placeholder for restaurantID */}
                <p>
                  <strong>Restaurant ID:</strong> Placeholder for ID
                </p>
              </div>
            ))}
          </div>
  
          {/* Gray line divider */}
          <hr className="border-gray-400 w-full mb-4" />
  
          {/* Hotel section */}
          <div className="mb-4">
            <h2 className="text-2xl mb-5 font-semibold">Hotel &#x1F3E8;</h2>
            <p>
              <strong>Booking URL:</strong> {itinerary.hotel.bookingURL}
            </p>
            <p>
              <strong>Price:</strong> ${itinerary.hotel.priceHotel}
            </p>
            {/* Displaying placeholder for hotelID */}
            <p>
              <strong>Hotel ID:</strong> Placeholder for ID
            </p>
            <p>
              <strong>Time:</strong> {itinerary.hotel.time}
            </p>
            <p>
              <strong>Location:</strong> {itinerary.hotel.locationHotel}
            </p>
          </div>
  
          {/* Gray line divider */}
          <hr className="border-gray-400 w-full mb-4" />
  
          {/* Events section */}
          <div className="mb-4">
            <h2 className="text-2xl mb-5 font-semibold">Events &#127796;</h2>
            {itinerary.events.map((event, index) => (
              <div key={index} className="mb-2">
                <p>
                  <strong>Type of Activity:</strong> {event.typeOfActivity}
                </p>
                <p>
                  <strong>Location:</strong> {event.locationEvent}
                </p>
                <p>
                  <strong>Time:</strong> {event.time}
                </p>
                <p>
                  <strong>Price:</strong> ${event.priceEvent}
                </p>
                {/* Displaying placeholder for eventID */}
                <p>
                  <strong>Event ID:</strong> Placeholder for ID
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
  
  
}
