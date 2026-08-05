// package com.keystone.backend;

// import org.springframework.boot.SpringApplication;
// import org.springframework.boot.autoconfigure.SpringBootApplication;

// @SpringBootApplication
// public class BackendApplication {
//     public static void main(String[] args) {
//         SpringApplication.run(BackendApplication.class, args);
//     }
// }


package com.keystone.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("Password Hash:");
        System.out.println(encoder.encode("Frank@123"));

        SpringApplication.run(BackendApplication.class, args);
    }
}