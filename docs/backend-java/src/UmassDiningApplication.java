package com.umassdining;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class UmassDiningApplication {

    public static void main(String[] args) {
        SpringApplication.run(UmassDiningApplication.class, args);
    }
}
