package com.kaafi.aqua;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class KaafiAquaApplication {
    public static void main(String[] args) {
        SpringApplication.run(KaafiAquaApplication.class, args);
        System.out.println("🚀 Kaafi Aqua Backend Started Successfully!");
    }
}