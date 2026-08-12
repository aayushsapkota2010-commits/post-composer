package com.example.PostComposerBackend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PostController {

    @GetMapping("/api/posts")
    public String getPosts() {
        return "Protected Posts Data";
    }

  

}