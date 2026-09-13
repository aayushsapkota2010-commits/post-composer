package com.example.PostComposerBackend.service;

import com.example.PostComposerBackend.dto.RegisterRequest;
import com.example.PostComposerBackend.dto.AuthResponse;
import com.example.PostComposerBackend.dto.LoginRequest;
import com.example.PostComposerBackend.entity.User;
import com.example.PostComposerBackend.repository.UserRepository;
import com.example.PostComposerBackend.security.JwtService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
@Service
public class UserService {

         private static final Logger logger =
        LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

   


    // =========================
    // AUTHENTICATION
    // =========================

    public String register(RegisterRequest request) {
        logger.info("User registration request received for email: {}",
        request.getEmail());

        if (repository.findByEmail(request.getEmail()).isPresent()) {
                logger.warn("Registration failed. Email already exists: {}",
        request.getEmail());
            return "Email already exists";
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setRole("USER");

        // Password is stored in encrypted form
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        repository.save(user);
        logger.info("User registered successfully: {}",
        request.getEmail());

        return "User Registered Successfully";
    }


    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        String token = jwtService.generateToken(
                request.getEmail()
        );

        return new AuthResponse(token);
    }


    // =========================
    // CRUD OPERATIONS
    // =========================

   public User createUser(User user) {

    logger.info("Creating new user: {}", user.getEmail());

    user.setPassword(
            passwordEncoder.encode(user.getPassword())
    );

    User savedUser = repository.save(user);

    logger.info("User created successfully with ID: {}",
            savedUser.getId());

    return savedUser;
}


   public List<User> getAllUsers() {

    logger.info("Fetching all users");

    return repository.findAll();
}


  public Optional<User> getUserById(Long id) {

    logger.info("Fetching user with ID: {}", id);

    return repository.findById(id);
}


    // UPDATE
    public Optional<User> updateUser(
            Long id,
            User updatedUser
    ) {
        logger.info("Updating user with ID: {}", id);

        return repository.findById(id)
                .map(existingUser -> {

                    existingUser.setName(
                            updatedUser.getName()
                    );

                    existingUser.setEmail(
                            updatedUser.getEmail()
                    );

                    existingUser.setRole(
                            updatedUser.getRole()
                    );

                    // Only update password if a new password
                    // was provided
                    if (updatedUser.getPassword() != null
                            && !updatedUser.getPassword().isBlank()) {

                        existingUser.setPassword(
                                passwordEncoder.encode(
                                        updatedUser.getPassword()
                                )
                        );
                    }

                    return repository.save(existingUser);
                });
    }


    // DELETE
    public boolean deleteUser(Long id) {
        logger.info("Deleting user with ID: {}", id);

        if (!repository.existsById(id)) {
            return false;
        }

        repository.deleteById(id);

        return true;
    }
    public Optional<User> getUserByEmail(String email) {
    return repository.findByEmail(email);
}
}