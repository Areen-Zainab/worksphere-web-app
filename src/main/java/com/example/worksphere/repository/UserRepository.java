package com.example.worksphere.repository;

import com.example.worksphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Find user by email (for login)
    Optional<User> findByEmail(String email);

    Optional<User> findById(Long id); // Fetch user by ID

    // Check if email is already registered (for signup validation)
    boolean existsByEmail(String email);
}
