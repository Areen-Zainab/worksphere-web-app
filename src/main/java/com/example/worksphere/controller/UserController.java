package com.example.worksphere.controller;

import java.io.IOException;
import java.util.Collections;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Optional;
import com.example.worksphere.dto.SignUpDto;
import com.example.worksphere.entity.User;
import com.example.worksphere.service.UserService;
import java.nio.file.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private static final String UPLOAD_DIR = "uploads/"; // Store files in 'uploads/' folder at the project root

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // SIGN UP: Register a new user
    @PostMapping("/signup")
    public ResponseEntity<String> signUp(@RequestBody SignUpDto signUpDto) {
        try {
            // Convert gender string to User.Gender enum
            User.Gender gender = User.Gender.valueOf(signUpDto.getGender().toUpperCase());

            User user = userService.registerUser(
                signUpDto.getFirstName(),
                signUpDto.getLastName(),
                signUpDto.getEmail(),
                signUpDto.getPassword(),
                User.Role.USER, 
                signUpDto.getDob(), 
                gender // Pass gender as User.Gender enum
            );

            System.out.println("User registered:\n" + user);
            return new ResponseEntity<>("User registered successfully.", HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>("Invalid gender value.", HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // LOGIN: Authenticate user
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody SignUpDto signUpDto) {
        try {
            // authenticate
            User user = userService.loginUser(
                signUpDto.getEmail(),
                signUpDto.getPassword()
            );
            if (user != null) {
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("message", "Invalid email or password"));
            }
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        Optional<User> userOptional = userService.getUserById(id);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setFirstName(updatedUser.getFirstName());
            user.setLastName(updatedUser.getLastName());
            user.setDob(updatedUser.getDob());
            user.setGender(updatedUser.getGender());
            user.setBio(updatedUser.getBio());
            user.setTitle(updatedUser.getTitle());
            userService.saveUser(user); // Save changes

            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Verify and update user password 
     * This endpoint first verifies the current password before allowing a change
     */
    @PutMapping("/{id}/password")
    public ResponseEntity<String> updatePassword(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<User> userOptional = userService.getUserById(id);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");
            
            // Validate password
            if (newPassword == null || newPassword.length() < 6) {
                return ResponseEntity.badRequest().body("Password must be at least 6 characters long");
            }
            
            // Check if current password is correct
            BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Current password is incorrect");
            }
            
            // Encrypt and update the new password
            String hashedPassword = passwordEncoder.encode(newPassword);
            user.setPassword(hashedPassword);
            userService.saveUser(user);
            
            return ResponseEntity.ok("Password updated successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/upload-pfp")
    public ResponseEntity<String> uploadProfilePicture(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file uploaded.");
        }

        try {
            Optional<User> userOptional = userService.getUserById(id);
            if (userOptional.isPresent()) {
                User user = userOptional.get();

                // Ensure upload directory exists
                Path uploadPath = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                String fileName = "user_" + id + ".jpg";
                Path filePath = uploadPath.resolve(fileName);

                // Save the file
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                // Update User entity with relative path to the file
                user.setProfilePicture("/uploads/" + fileName);
                userService.saveUser(user);

                return ResponseEntity.ok("/uploads/" + fileName);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            return ResponseEntity.status(500).body("File upload failed: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            return ResponseEntity.ok(userService.getAllUsers());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("message", "Error retrieving users"));
        }
    }

    /**
     * Update user email
     * This endpoint allows users to change their email address after verifying their password
     */
    @PutMapping("/{id}/email")
    public ResponseEntity<String> updateEmail(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<User> userOptional = userService.getUserById(id);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            
            String newEmail = request.get("newEmail");
            String password = request.get("password");
            
            // Validate email format
            if (newEmail == null || !newEmail.matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")) {
                return ResponseEntity.badRequest().body("Invalid email format");
            }
            
            // Check if password is correct
            BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            if (!passwordEncoder.matches(password, user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Current password is incorrect");
            }
            
            // Check if email is already in use
            if (userService.isEmailTaken(newEmail) && !newEmail.equals(user.getEmail())) {
                return ResponseEntity.badRequest().body("Email is already in use");
            }
            
            // Update email
            user.setEmail(newEmail);
            userService.saveUser(user);
            
            return ResponseEntity.ok("Email updated successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get notification settings for a user
     * This is a placeholder implementation since the actual notification settings entity is not provided
     */
    @GetMapping("/{id}/notifications")
    public ResponseEntity<?> getNotificationSettings(@PathVariable Long id) {
        Optional<User> userOptional = userService.getUserById(id);
        if (userOptional.isPresent()) {
            // This is a placeholder. In a real implementation, you would fetch notification settings
            // from a dedicated repository or service
            Map<String, Boolean> defaultSettings = Map.of(
                "emailNotifications", true,
                "pushNotifications", true,
                "taskReminders", true,
                "weeklyDigest", false,
                "mentions", true
            );
            
            return ResponseEntity.ok(defaultSettings);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get appearance settings for a user
     * This is a placeholder implementation since the actual appearance settings entity is not provided
     */
    @GetMapping("/{id}/appearance")
    public ResponseEntity<?> getAppearanceSettings(@PathVariable Long id) {
        Optional<User> userOptional = userService.getUserById(id);
        if (userOptional.isPresent()) {
            // This is a placeholder. In a real implementation, you would fetch appearance settings
            // from a dedicated repository or service
            Map<String, String> defaultSettings = Map.of(
                "theme", "system"
            );
            
            return ResponseEntity.ok(defaultSettings);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Endpoint to check if an email is already taken
     */
    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmailExists(@RequestParam String email) {
        boolean exists = userService.isEmailTaken(email);
        return ResponseEntity.ok(Collections.singletonMap("exists", exists));
    }
}