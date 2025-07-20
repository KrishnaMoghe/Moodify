import React, { useEffect, useState, useCallback } from "react";
import Select from "react-select";
import { getTopArtists, searchArtists } from "../api/spotify";

export default function ArtistSelector({ artists, setArtists }) {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load user's top artists
  useEffect(() => {
    const loadTopArtists = async () => {
      setIsLoading(true);
      try {
        const res = await getTopArtists();
        setOptions(
          res.data.map(a => ({
            value: a.id,
            label: a.name,
          }))
        );
      } catch (error) {
        console.error("Error loading top artists:", error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTopArtists();
  }, []);

  // Debounce search function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  const searchForArtists = useCallback(
    debounce(async (inputValue) => {
      if (inputValue.length < 2) return;
      
      setIsLoading(true);
      try {
        const res = await searchArtists(inputValue);
        setOptions(
          res.data.map(a => ({
            value: a.id,
            label: a.name,
          }))
        );
      } catch (error) {
        console.error("Error searching artists:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (inputValue) => {
    searchForArtists(inputValue);
  };

  return (
    <div>
      <h3>Pick your favorite artist(s):</h3>
      <Select
        isMulti
        options={options}
        value={artists}
        onChange={setArtists}
        onInputChange={handleInputChange}
        placeholder="Type to search artists..."
        isLoading={isLoading}
        noOptionsMessage={({ inputValue }) => 
          inputValue.length < 2 
            ? "Type at least 2 characters to search" 
            : "No artists found"
        }
      />
    </div>
  );
}
