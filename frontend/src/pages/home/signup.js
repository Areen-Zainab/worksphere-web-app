import React, { useState, useEffect } from 'react';
import styles from '../../css/home/signup.module.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dob: '',
    gender: 'MALE',
    password: '',
    confirmPassword: ''
  });

  const [toast, setToast] = useState({
    visible: false,
    type: '',
    title: '',
    message: ''
  });

  useEffect(() => {
    localStorage.removeItem("loggedInUser");
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  const showToast = (type, title, message) => {
    setToast({
      visible: true,
      type,
      title,
      message
    });

    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const goToLogin = () => {
    window.location.href = '/login';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showToast("error", "Error", "Passwords do not match");
      return;
    }

    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      dob: formData.dob,
      gender: formData.gender,
      password: formData.password
    };

    try {
      const response = await fetch("http://localhost:8080/api/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        showToast("success", "Success!", "Account created successfully");
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        const errorData = await response.text();
        showToast("error", "Signup Failed", errorData);
      }
    } catch (error) {
      showToast("error", "Error", "Server error. Please try again");
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
          <h2>Come join us!</h2>
          <p>
            We are excited to have you here. Create an account
            to get access to exclusive offers and rewards.
          </p>
          <button 
            onClick={goToLogin}
            className={styles.signinButton}
          >
            Already have an account? Sign in
          </button>
        </div>

        <div className={styles.right}>
          <h2>Signup</h2>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputRow}>
              <input
                type="text"
                id="firstName"
                placeholder="First Name"
                className={styles.input}
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              
              <input
                type="text"
                id="lastName"
                placeholder="Last Name"
                className={styles.input}
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            
            <input
              type="email"
              id="email"
              placeholder="Email"
              className={styles.input}
              value={formData.email}
              onChange={handleChange}
              required
            />
            
            <div className={styles.inputRow}>
              <input
                type="date"
                id="dob"
                placeholder="Date of Birth"
                className={styles.input}
                value={formData.dob}
                onChange={handleChange}
                required
              />
              
              <select
                id="gender"
                className={styles.select}
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            
            <input
              type="password"
              id="password"
              placeholder="Password"
              className={styles.input}
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm Password"
              className={styles.input}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            
            <button 
              type="submit" 
              className={styles.submitButton}
            >
              Signup
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;