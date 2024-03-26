import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ isMobile, iconSize }) => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleChange = (event) => {
    const newSearchValue = event.target.value;
    setSearch(newSearchValue); // Update state on change
    // Navigate as the user types, updating the query parameter
    navigate(`/search?q=${encodeURIComponent(newSearchValue)}`);
  };

  if (isMobile) {
    return (
      <>
        <FaSearch size={iconSize} />
      </>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-2xl border-2 px-4 py-3">
      <FaSearch size={15} />
      <input
        type="text"
        value={search}
        onChange={handleChange}
        placeholder="Search"
        className="w-96 bg-transparent outline-none"
      />
    </div>
  );
};

export default SearchBar;