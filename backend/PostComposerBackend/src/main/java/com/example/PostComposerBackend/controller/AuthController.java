package com.example.PostComposerBackend.controller;

import com.example.PostComposerBackend.dto.RegisterRequest;
import com.example.PostComposerBackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.PostComposerBackend.dto.LoginRequest;
import com.example.PostComposerBackend.dto.AuthResponse;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        return userService.register(request);
    }

    @PostMapping("/login")
public AuthResponse login(@RequestBody LoginRequest request) {
    return userService.login(request);
}
}