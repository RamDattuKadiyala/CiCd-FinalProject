package com.hometutorfinder.backend.controller;

import com.hometutorfinder.backend.model.User;
import com.hometutorfinder.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User admin) {
        // ✅ Hardcoded admin credentials (can be moved to DB later)
        if ("admin".equals(admin.getEmail()) && "admin123".equals(admin.getPassword())) {
            String token = UUID.randomUUID().toString(); // dummy token for now
            return ResponseEntity.ok(Map.of(
                    "message", "Admin login successful",
                    "token", token,
                    "role", "ADMIN"
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid admin credentials"));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userService.getAllUsers();
        if (users.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body("No users found");
        }
        return ResponseEntity.ok(users);
    }
}
