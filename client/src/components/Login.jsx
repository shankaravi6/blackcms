import React, { useState } from "react";
import axios from "axios";
import { Button, TextField } from "@mui/material";
import { BASE_URL } from "../hooks/baseURL";

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${BASE_URL}/api/login`, formData);

      if (response.data.status === true) {
        onLogin(); // successful login
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="h-screen w-screen flex">
      {/* Left Side - Image (Hidden on small screens) */}
      <div className="w-1/2 bg-black flex items-center justify-center hidden md:block">
        <img
          src="/login.jpg" // Replace with your image path
          alt="Login Visual"
          className="object-cover h-full w-full"
        />
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 bg-black flex items-center justify-center text-white">
        <form onSubmit={handleSubmit} className="w-9/12 flex flex-col gap-10">
          <h2 className="text-2xl mb-6 text-center font-bold">BLACK CMS</h2>

          <TextField
            name="username"
            value={formData.username}
            onChange={handleChange}
            type="text"
            label="Username"
            fullWidth
            required
          />
          <TextField
            name="password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            label="Password"
            fullWidth
            required
          />

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded transition duration-300"
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
