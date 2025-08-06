import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    userId: 1,               // TODO: replace with real logged-in ID
    name: "",
    gender: "",
    age: "",
    nationality: "",
    experienceLevel: "",
    photoURL: ""
  });

  const [status, setStatus] = useState("");

  /* ------------------------------------------------------------
     Fetch existing profile once on mount
  ------------------------------------------------------------ */
  useEffect(() => {
    fetch("http://localhost:3001/api/users/1")
      .then((res) => res.json())
      .then((data) => {
        // Accept either UserID or userId from backend
        setProfile({
          userId:        data.userId        ?? data.UserID ?? profile.userId,
          name:          data.name          ?? data.Name          ?? "",
          gender:        data.gender        ?? data.Gender        ?? "",
          age:           (data.age ?? data.Age ?? "").toString(),
          nationality:   data.nationality   ?? data.Nationality   ?? "",
          experienceLevel: data.experienceLevel ?? data.ExperienceLevel ?? "",
          photoURL:      data.photoURL      ?? data.PhotoURL      ?? ""
        });
      })
      .catch((err) => {
        console.error("Failed to fetch profile", err);
        setStatus("Error loading profile");
      });
  }, []);

  /* ------------------------------------------------------------
     Controlled-input helper
  ------------------------------------------------------------ */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  /* ------------------------------------------------------------
     Save to backend
  ------------------------------------------------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Saving…");

    const payload = {
      ...profile,
      age: profile.age ? Number(profile.age) : null
    };

    const res = await fetch(
      "http://localhost:3001/api/users/update-profile",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    if (res.ok) {
      localStorage.setItem("profilePhotoURL", profile.photoURL);
      setStatus("Saved!");
    } else {
      setStatus("Error saving profile");
    }
  };

  /* ------------------------------------------------------------
     Render
  ------------------------------------------------------------ */
  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6 bg-white rounded-xl shadow-md mt-10">
      <h2 className="text-3xl font-bold text-center text-green-700">
        Edit Your Profile
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-md shadow-sm"
          />
        </div>

        {/* Age + Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={profile.age}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={profile.gender}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-md shadow-sm"
            >
              <option value="">Select</option>
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        {/* Nationality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nationality
          </label>
          <input
            type="text"
            name="nationality"
            value={profile.nationality}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-md shadow-sm"
          />
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Experience Level
          </label>
          <select
            name="experienceLevel"
            value={profile.experienceLevel}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-md shadow-sm"
          >
            <option value="">Select</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Expert</option>
          </select>
        </div>

        {/* Photo URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photo URL
          </label>
          <input
            type="text"
            name="photoURL"
            value={profile.photoURL}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-md shadow-sm"
          />
        </div>

        {/* Preview */}
        {profile.photoURL && (
          <div className="flex justify-center">
            <img
              src={profile.photoURL}
              alt="Profile"
              className="w-32 h-32 object-cover rounded-full border shadow-md mt-2"
            />
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition"
        >
          Save Profile
        </button>

        <p className="text-sm text-center text-slate-500">{status}</p>
      </form>
    </div>
  );
}
