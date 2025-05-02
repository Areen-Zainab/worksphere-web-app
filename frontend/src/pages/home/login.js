import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../../css/home/login.module.css';
import Dashboard from '../dashboard'; 

const Login = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // State for toast messages
  const [toast, setToast] = useState({
    visible: false,
    type: '',
    title: '',
    message: ''
  });

  // Error message state
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing user data from localStorage on component mount
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userData");
    localStorage.removeItem("UserFName");
    localStorage.removeItem("UserLName");
    localStorage.removeItem("loggedInUserID");
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  // Show toast message
  const showToast = (type, title, message) => {
    setToast({
      visible: true,
      type,
      title,
      message
    });

    // Hide toast after 3 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { email, password } = formData;

    if (!email || !password) {
      showToast("error", "Error", "Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const user = await response.json();
        console.log(user);
        
        // Store entire user object in localStorage
        localStorage.setItem("userData", JSON.stringify(user));
        
        // Keep individual fields for backward compatibility
        localStorage.setItem("loggedInUser", user.email);
        localStorage.setItem("UserFName", user.firstName);
        localStorage.setItem("UserLName", user.lastName);
        localStorage.setItem("loggedInUserID", user.id);
        
        // Reset form
        setFormData({ email: '', password: '' });
        
        showToast("success", "Login Successful!", "Redirecting to your Dashboard.");

        // Redirect based on user type
        setTimeout(() => {
          navigate(user.userType === "ADMIN" ? "/admin" : "/dashboard");
        }, 2000);

      } else {
        const errorData = await response.json();
        console.log(errorData);
        setErrorMessage("Invalid Credentials");
        showToast("error", "Login Failed", "Invalid Credentials. Try Again.");
      }
    } catch (error) {
      console.error(error);
      showToast("error", "Login Failed", "Server error. Try Again Later");
    }
  };

  return (
    <div className={styles.page}>
      <div className={`${styles.toast} ${styles[toast.type]} ${toast.visible ? styles.show : ''}`}>
        <div className={styles.toastTitle}>{toast.title}</div>
        <div>{toast.message}</div>
      </div>

      <div className={styles.container}>
        <div className={styles.left}>
          <h2>Welcome Back</h2>
          <p>
            We are so excited to have you here. Login to your account 
            to get access to exclusive offers, rewards, and discounts.
          </p>
          <Link 
            to="/signup" 
            className={styles.signinButton}
          >
            Don't have an account? Sign Up
          </Link>
        </div>

        <div className={styles.right}>
          <h2>Login</h2>
          {errorMessage && (
            <p className={styles.errorMessage}>{errorMessage}</p>
          )}
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              type="email"
              id="email"
              placeholder="Email"
              className={styles.input}
              value={formData.email}
              onChange={handleChange}
              required
            />
            
            <input
              type="password"
              id="password"
              placeholder="Password"
              className={styles.input}
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            <button 
              type="submit" 
              className={styles.submitButton}
              
            >
              Login
            </button>
            
            <Link to="/forgot-password" className={styles.forgotLink}>
              Forgot Password?
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;