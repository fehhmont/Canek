package com.canek.canek.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Aplica a configuração a todos os endpoints da API
                .allowedOrigins("http://localhost:5173") // Permite requisições desta origem (seu frontend Vite)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS"); // Permite estes métodos HTTP
    }
}