package com.example.worksphere.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import com.example.worksphere.entity.User;
import com.example.worksphere.repository.UserRepository;
import com.example.worksphere.dto.UpdateProfileDto;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Path;
@Service
public class UserService {
    private final String uploadDir = "uploads/profile_pictures/";
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // dont use BcryptPasswordEncoder

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // sign up
    public User registerUser(String firstName, String lastName, String email, String password, User.Role role, LocalDate dob, User.Gender gender) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email is already registered.");
        }

        User newUser = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .password(passwordEncoder.encode(password))
                .dob(dob)
                .gender(gender != null ? gender : User.Gender.OTHER)
                .role(role != null ? role : User.Role.USER) 
                .createdAt(LocalDateTime.now())
                .build();

        return userRepository.save(newUser);
    }

    // login
    public User loginUser(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found.");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials.");
        }

        return user; 
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public void saveUser(User user) {
        if (!user.getPassword().startsWith("$2a$")) { // Prevent double hashing
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        userRepository.save(user);
    }    

    @Transactional
    public User updateUserProfile(Long userId, UpdateProfileDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update fields if they are provided
        if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null && !request.getLastName().isBlank()) {
            user.setLastName(request.getLastName());
        }
        if (request.getBio() != null && !request.getBio().isBlank()) {
            user.setBio(request.getBio());
        }
        if (request.getDob() != null) {
            user.setDob(request.getDob());
        }

        if (request.getGender() != null) {
            try {
                user.setGender(User.Gender.valueOf(request.getGender().toUpperCase())); 
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid gender value. Allowed: MALE, FEMALE, OTHER");
            }
        }

        return userRepository.save(user);
    }

    public User updateProfilePicture(Long userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Ensure upload directory exists
        Files.createDirectories(Path.of(uploadDir));

        // Save file with a unique name
        String fileName = "user_" + userId + "_" + file.getOriginalFilename();
        Path filePath = Path.of(uploadDir + fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Update user's profile picture URL
        user.setProfilePicture(fileName);
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
}
