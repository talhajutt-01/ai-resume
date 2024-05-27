import React, { useState } from "react";
import Components from "./components";
import { useNavigate } from "react-router-dom";

function Login() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    username: ""
  });
  const [signIn, setSignIn] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignInSubmit = async (e) => {
    e.preventDefault();

    // Check if any of the input fields are empty
    if (!credentials.email || !credentials.password) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch("https://ai-resume-sepia.vercel.app/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const json = await response.json();
      console.log(json);

      // Handle login success
      
      setError("");
      navigate("/Home")
      alert("Login successful!");
     

    } catch (error) {
      console.error("Error during login:", error.message);
      // Handle error here
      setError("Login failed. Please check your credentials.");
      alert("Please Enter correct Details:", error.message);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();

    // Check if any of the input fields are empty
    if (!credentials.username || !credentials.email || !credentials.password) {
      alert("Please fill in all fields.");
      return;
    }

    if (!validateSignUp()) {
      return;
    }

    try {
      const response = await fetch("https://ai-resume-sepia.vercel.app//api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          username: credentials.username
        })
      });

      if (!response.ok) {
        const json = await response.json();

        // Check if the response indicates that the user already exists
        if (json.error && json.error.includes("user already exists")) {
          setError(
            "User already exists. Please login or choose a different username."
          );
        } else {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      } else {
        const json = await response.json();
        console.log(json);

        // Handle signup success
        setError("");
        navigate("/Home")
        alert("Signup successful!");
       
      }
    } catch (error) {
      console.error("Error during signup:", error.message);
      setError("Signup failed. Please try again.");
      // Handle other errors here
    }
  };

  const handleToggle = () => {
    setSignIn((prevSignIn) => !prevSignIn);
    // Clear form fields and errors when toggling between login and signup
    setCredentials({ email: "", password: "", username: "" });
    setError("");
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const validateSignUp = () => {
    // Basic frontend validation for name, email, and password
    if (credentials.username.length < 3) {
      setError("Username must be at least 3 characters long.");
      return false;
    }
    if (!isValidEmail(credentials.email)) {
      setError("Invalid email address.");
      return false;
    }
    if (credentials.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    setError("");
    return true;
  };

  const isValidEmail = (email) => {
    // Basic email validation using a regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <Components.Container>
      {signIn ? (
        <Components.SignUpContainer signIn={signIn}>
          <Components.FormContainer onSubmit={handleSignUpSubmit}>
            <Components.Title>Create Account</Components.Title>
            <Components.Input
              type="text"
              name="username"
              value={credentials.username}
              placeholder="Username"
              onChange={onChange}
            />
            <Components.Input
              type="email"
              name="email"
              value={credentials.email}
              placeholder="Email"
              onChange={onChange}
            />
            <Components.Input
              type="password"
              name="password"
              value={credentials.password}
              placeholder="Password"
              onChange={onChange}
            />
            <Components.Button type="submit">Sign Up</Components.Button>
          </Components.FormContainer>
        </Components.SignUpContainer>
      ) : (
        <Components.SignInContainer signIn={signIn}>
          <Components.FormContainer onSubmit={handleSignInSubmit}>
            <Components.Title>Sign in</Components.Title>
            <Components.Input
              type="email"
              name="email"
              value={credentials.email}
              placeholder="Email"
              onChange={onChange}
            />
            <Components.Input
              type="password"
              name="password"
              value={credentials.password}
              placeholder="Password"
              onChange={onChange}
            />
            <Components.Anchor href="#">Forgot your password?</Components.Anchor>
            <Components.Button type="submit">Sign In</Components.Button>
          </Components.FormContainer>
        </Components.SignInContainer>
      )}

      <Components.OverlayContainer signIn={signIn}>
        <Components.Overlay signIn={signIn}>
          <Components.LeftOverlayPanel signIn={signIn}>
            <Components.Title>Hello, Friend!</Components.Title>
            <Components.Paragraph>
            Enter your personal details and start the journey with us
            </Components.Paragraph>
            <Components.GhostButton onClick={handleToggle}>
              {signIn ? "Login" : "Sign Up"}
            </Components.GhostButton>
          </Components.LeftOverlayPanel>

          <Components.RightOverlayPanel signIn={signIn}>
            <Components.Title>Welcome Back!</Components.Title>
            <Components.Paragraph>
            To keep connected with us, please login with your personal info
            </Components.Paragraph>
            <Components.GhostButton onClick={handleToggle}>
              {signIn ? "Login" : "Sign Up"}
            </Components.GhostButton>
          </Components.RightOverlayPanel>
        </Components.Overlay>
      </Components.OverlayContainer>

      {error && <div style={{ color: "red" }}>{error}</div>}
    </Components.Container>
  );
}

export default Login;
