import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SearchResultPage = () => {
  const [searchParams] = useSearchParams();
  let searchTerm = searchParams.get('q') || ''; // Ensure searchTerm is a string to prevent errors
  searchTerm = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);

  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false); // Track if a search has been initiated
  const navigate = useNavigate();

  const fetchSearchResults = async () => {
    setIsLoading(true);
    setShowLoadingIndicator(false);
    setSearchInitiated(true); // Indicate that a search has been initiated

    let loadingTimeout = setTimeout(() => {
      if (isLoading) {
        setShowLoadingIndicator(true);
      }
    }, 500);

    try {
      const response = await axios.get(`http://localhost:8080/itineraries/?city=${searchTerm}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Failed to fetch search results:", error);
    } finally {
      clearTimeout(loadingTimeout);
      setIsLoading(false);
      setShowLoadingIndicator(false);
    }
  };

  useEffect(() => {
    if (searchTerm) { // Only fetch results if there is a searchTerm
      fetchSearchResults();
    }
  }, [searchTerm]);

  return (
    <div className="flex flex-col h-screen justify-start items-center pt-2">
      <h2 className="font-serif text-3xl font-light text-white-800 mb-4">Search Results for: {searchTerm}</h2>
      {showLoadingIndicator ? (
        <div className="flex justify-center items-center space-x-3">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" style={{ animationDuration: '0.5s' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-semibold text-blue-600">Loading...</p>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((itinerary) => (
              <div key={itinerary.id} className="cursor-pointer rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden" onClick={() => navigate(`/itineraries?id=${itinerary.id}`)}>
                <img src={itinerary.images[0]} alt="Itinerary" className="h-56 w-full object-cover" />
                <div className="p-4 bg-white">
                  <h3 className="text-xl font-light text-gray-900">{itinerary.name}</h3>
                  <p className="text-gray-600">{itinerary.city}</p>
                  <p className="font-light text-gray-800">Total Price: ${itinerary.totalPrice}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : searchInitiated && !isLoading ? (
        <p className="text-lg text-red-500">No search results found for {searchTerm}</p>
      ) : null}
    </div>
  );
};

export default SearchResultPage;