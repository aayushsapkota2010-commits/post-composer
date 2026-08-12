package com.example.PostComposerBackend.service;

import com.example.PostComposerBackend.dto.RegisterRequest;
import com.example.PostComposerBackend.entity.User;
import com.example.PostComposerBackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.PostComposerBackend.dto.AuthResponse;
import com.example.PostComposerBackend.dto.LoginRequest;
import com.example.PostComposerBackend.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

@Service
public class UserService {

    @Autowired
    private UserRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    public String register(RegisterRequest request) {

        if (repository.findByEmail(request.getEmail()).isPresent()) {
            return "Email already exists";
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setRole("USER");

        // Password will be stored encrypted
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        repository.save(user);

        return "User Registered Successfully";
    }

    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        String token = jwtService.generateToken(request.getEmail());

        return new AuthResponse(token);
    }
}