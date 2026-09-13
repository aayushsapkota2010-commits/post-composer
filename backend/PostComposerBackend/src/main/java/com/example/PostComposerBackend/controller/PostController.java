package com.example.PostComposerBackend.controller;

import com.example.PostComposerBackend.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PostController {

    @GetMapping("/api/posts")
    public ResponseEntity<ApiResponse<String>> getPosts() {

        ApiResponse<String> response = new ApiResponse<>(
                true,
                "Posts fetched successfully",
                "Protected Posts Data"
        );

        return ResponseEntity.ok(response);
    }
}