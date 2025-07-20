import React, { useEffect, useState } from "react";
import Select from "react-select";
import { getTopArtists, searchArtists } from "../api/spotify";

export default function ArtistSelector({ artists, setArtists }) {
  const [options, setOptions] = useState([]);
  const [error, setError] = useState(null);

  // Load user's top artists with debugging
  useEffect(() => {
    const loadTopArtists = async () => {
      try {
        console.log("Attempting to load top artists...");
        const res = await getTopArtists();
        console.log("Top artists response:", res.data);
        
        if (res.data && res.data.length > 0) {
          const artistOptions = res.data.map(a => ({
            value: a.id,
            label: a.name,
          }));
          console.log("Mapped artist options:", artistOptions);
          setOptions(artistOptions);
        } else {
          console.log("No top artists found in response");
          setError("No top artists found. Try searching for artists instead.");
        }
      } catch (error) {
        console.error("Error loading top artists:", error);
        console.error("Error details:", error.response?.data);
        setError(`Error: ${error.response?.status || error.message}`);
      }
    };
    
    loadTopArtists();
  }, []);

  // When user types, call backend to search
  const handleInputChange = async (inputValue) => {
    if (inputValue.length < 2) {
      return;
    }
    
    try {
      console.log("Searching for artists:", inputValue);
      const res = await searchArtists(inputValue);
      console.log("Search response:", res.data);
      
      if (res.data && res.data.length > 0) {
        const searchOptions = res.data.map(a => ({
          value: a.id,
          label: a.name,
        }));
        console.log("Mapped search options:", searchOptions);
        setOptions(searchOptions);
        setError(null);
      } else {
        console.log("No artists found in search");
        setOptions([]);
        setError("No artists found for this search");
      }
    } catch (error) {
      console.error("Error searching artists:", error);
      console.error("Error details:", error.response?.data);
      setError(`Search error: ${error.response?.status || error.message}`);
    }
  };

  return (
    <div>
      <h3>Pick your favorite artist(s):</h3>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <Select
        isMulti
        options={options}
        value={artists}
        onChange={setArtists}
        onInputChange={handleInputChange}
        placeholder="Type to search artists (e.g., 'Taylor Swift', 'Drake')..."
        noOptionsMessage={({ inputValue }) => 
          inputValue.length < 2 
            ? "Type at least 2 characters to search" 
            : "No artists found - try a different search"
        }
      />
    </div>
  );
}
