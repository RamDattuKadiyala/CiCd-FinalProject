package com.hometutorfinder.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)   // name cannot be null
    private String name;

    @Column(unique = true, nullable = false) // email must be unique & not null
    private String email;

    @Column(nullable = false)   // password cannot be null
    private String password;

    @Column(nullable = false)   // role always required
    private String role = "USER";

    @Column(nullable = false)   // status always required
    private String status = "ACTIVE";

    // --- Getters & Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
