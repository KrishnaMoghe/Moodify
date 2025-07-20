import React, { useEffect, useState } from "react";
import Select from "react-select";
import { getTopArtists, searchArtists } from "../api/spotify";

export default function ArtistSelector({ artists, setArtists }) {
  const [options, setOptions] = useState([]);

  // Load user's top artists
  useEffect(() => {
    getTopArtists().then(res => {
      setOptions(
        res.data.map(a => ({
          value: a.id,
          label: a.name,
        }))
      );
    });
  }, []);

  // When user types, call backend to search
  const handleInputChange = (inputValue) => {
    if (inputValue.length < 2) return;
    searchArtists(inputValue).then(res => {
      setOptions(
        res.data.map(a => ({
          value: a.id,
          label: a.name,
        }))
      );
    });
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
      />
    </div>
  );
}
