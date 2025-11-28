package com.hometutorfinder.backend.controller;

import com.hometutorfinder.backend.model.User;
import com.hometutorfinder.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // allow frontend
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // --- Signup ---
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        try {
            User saved = userService.register(user);

            // Return flat user object (no password)
            return ResponseEntity.ok(Map.of(
                    "id", saved.getId(),
                    "name", saved.getName(),
                    "email", saved.getEmail(),
                    "role", saved.getRole(),
                    "status", saved.getStatus()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // --- Login ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        Optional<User> loggedIn = userService.login(email, password);

        if (loggedIn.isPresent()) {
            User user = loggedIn.get();

            // Return flat user object (no password)
            return ResponseEntity.ok(Map.of(
                    "id", user.getId(),
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "role", user.getRole(),
                    "status", user.getStatus()
            ));
        } else {
            return ResponseEntity
                    .status(401)
                    .body(Map.of("error", "Invalid email or password"));
        }
    }

    // --- Get all users (optional, admin use) ---
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
