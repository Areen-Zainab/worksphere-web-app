package com.example.worksphere.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(name = "email", nullable = false, unique = true, length = 100, columnDefinition = "VARCHAR(100) COLLATE utf8mb4_unicode_ci")
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String password;

    @Column(name = "profile_picture", length = 255)
    private String profilePicture;

    @Column(name = "dob")
    private LocalDate dob;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false)
    private Gender gender;

    @Column(name = "bio", length = 512)
    private String bio;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Column(name = "title", length = 50)
    private String title;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (role == null) {
            role = Role.USER;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum Gender {
        MALE, FEMALE, OTHER
    }

    public enum Role {
        ADMIN, USER
    }

    public String getBio() {  // Fixed getter naming
        return this.bio;
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +  // Avoid printing passwords in production; this is for debugging purposes
                ", profilePicture='" + profilePicture + '\'' +
                ", dob=" + dob +
                ", gender=" + gender +
                ", bio='" + bio + '\'' +
                ", role=" + role +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }

}
