const MOODS = ["Happy", "Sad", "Energetic", "Chill", "Romantic"];

export default function MoodSelector({ mood, setMood }) {
  return (
    <div>
      <h3>Pick your current mood:</h3>
      {MOODS.map(m => (
        <label key={m} style={{ marginRight: "12px" }}>
          <input
            type="radio"
            checked={mood === m}
            onChange={() => setMood(m)}
          />
          {m}
        </label>
      ))}
    </div>
  );
}
