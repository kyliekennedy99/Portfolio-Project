import { useState } from "react";

export default function SettingsPage() {
  const [name, setName] = useState("John Doe");
  const [age, setAge] = useState(25);
  const [email, setEmail] = useState("johndoe@gmail.com");
  const [notifications, setNotifications] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    alert("Settings saved successfully.");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Personal Info */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Notifications</h2>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
              className="h-5 w-5 text-green-600"
            />
            <span className="text-gray-700">Enable email notifications</span>
          </label>
        </section>

        {/* Password */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Change Password</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        </section>

        <div className="pt-6">
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition"
          >
            Save Changes
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <section className="mt-12 border-t pt-8">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
        <button
          onClick={() => window.confirm("Are you sure you want to delete your account?")}
          className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Delete Account
        </button>
      </section>
    </div>
  );
}
