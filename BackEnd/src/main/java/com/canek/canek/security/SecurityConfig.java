package com.canek.canek.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private SecurityFilter securityFilter;

    // Injeta os dois serviços de autenticação que você tem
    @Autowired
    @Qualifier("authorizationService") // Nome padrão do bean para o serviço de Usuario
    private UserDetailsService usuarioAuthService;

    @Autowired
    @Qualifier("administradorAuthService") // Nome do bean para o serviço de Administrador
    private UserDetailsService administradorAuthService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        // Libera as rotas públicas de login e cadastro para ambos os tipos de usuário
                        .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/administrador/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/cadastro").permitAll()
                    
                        // Exige autenticação para todas as outras rotas
                        .anyRequest().authenticated()
                )
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
    
    // Cria um "provedor" que sabe como autenticar Usuários (consultando a tabela usuarios)
    @Bean
    public DaoAuthenticationProvider usuarioAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(usuarioAuthService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    // Cria um "provedor" que sabe como autenticar Administradores (consultando a tabela administradores)
    @Bean
    public DaoAuthenticationProvider administradorAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(administradorAuthService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    // Cria o Gerente de Autenticação que usa os dois provedores acima
    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder =
                http.getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder.authenticationProvider(usuarioAuthenticationProvider());
        authenticationManagerBuilder.authenticationProvider(administradorAuthenticationProvider());
        return authenticationManagerBuilder.build();
    }

    // Define um bean único para o PasswordEncoder, que será usado em toda a aplicação
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}