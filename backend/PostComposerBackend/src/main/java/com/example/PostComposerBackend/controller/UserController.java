package com.example.PostComposerBackend.controller;

import com.example.PostComposerBackend.entity.User;
import com.example.PostComposerBackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    public User getCurrentUser(Authentication authentication) {

        String email = authentication.getName();

        return userRepository.findByEmail(email).orElse(null);
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "Welcome User";
    }
}