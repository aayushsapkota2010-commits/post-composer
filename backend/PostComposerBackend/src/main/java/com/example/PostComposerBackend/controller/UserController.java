package com.example.PostComposerBackend.controller;

import com.example.PostComposerBackend.dto.UserRequest;
import com.example.PostComposerBackend.dto.UserResponse;
import com.example.PostComposerBackend.entity.User;
import com.example.PostComposerBackend.response.ApiResponse;
import com.example.PostComposerBackend.service.UserService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserService userService;

    // =========================
    // CURRENT LOGGED-IN USER
    // =========================

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            Authentication authentication) {

        String email = authentication.getName();

        Optional<User> user = userService.getUserByEmail(email);

        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false,
                            "User not found",
                            null
                    ));
        }

        User currentUser = user.get();

        UserResponse response = new UserResponse(
                currentUser.getId(),
                currentUser.getName(),
                currentUser.getEmail(),
                currentUser.getRole()
        );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Current user fetched successfully",
                        response
                )
        );
    }

    // =========================
    // DASHBOARD
    // =========================

    @GetMapping("/dashboard")
    public String dashboard() {
        return "Welcome User";
    }

    // =========================
    // CREATE
    // =========================

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody UserRequest request) {

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());

        User createdUser = userService.createUser(user);

        UserResponse response = new UserResponse(
                createdUser.getId(),
                createdUser.getName(),
                createdUser.getEmail(),
                createdUser.getRole()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "User created successfully",
                        response
                ));
    }

    // =========================
    // READ - ALL USERS
    // =========================

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {

        List<User> users = userService.getAllUsers();

        List<UserResponse> responses = users.stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Users fetched successfully",
                        responses
                )
        );
    }

    // =========================
    // READ - USER BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
            @PathVariable Long id) {

        Optional<User> user = userService.getUserById(id);

        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false,
                            "User not found",
                            null
                    ));
        }

        User foundUser = user.get();

        UserResponse response = new UserResponse(
                foundUser.getId(),
                foundUser.getName(),
                foundUser.getEmail(),
                foundUser.getRole()
        );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "User fetched successfully",
                        response
                )
        );
    }

    // =========================
    // UPDATE
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @RequestBody User updatedUser) {

        Optional<User> user = userService.updateUser(
                id,
                updatedUser
        );

        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false,
                            "User not found",
                            null
                    ));
        }

        User updated = user.get();

        UserResponse response = new UserResponse(
                updated.getId(),
                updated.getName(),
                updated.getEmail(),
                updated.getRole()
        );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "User updated successfully",
                        response
                )
        );
    }

    // =========================
    // DELETE
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id) {

        boolean deleted = userService.deleteUser(id);

        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false,
                            "User not found",
                            null
                    ));
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "User deleted successfully",
                        null
                )
        );
    }
}