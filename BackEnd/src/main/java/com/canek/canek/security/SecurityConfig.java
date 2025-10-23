package com.canek.canek.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// --- NOVOS IMPORTS ---
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private SecurityFilter securityFilter;

    @Autowired
    @Qualifier("authorizationService")
    private UserDetailsService usuarioAuthService;

    @Autowired
    @Qualifier("administradorAuthService")
    private UserDetailsService administradorAuthService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .cors(withDefaults()) // <-- 1. ADICIONE ESTA LINHA PARA ATIVAR O CORS NA CADEIA DE SEGURANÇA
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                    // Suas regras de autorização permanecem as mesmas
                    .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                    .requestMatchers(HttpMethod.POST, "/auth/cadastro").permitAll()
                    .requestMatchers(HttpMethod.POST, "/auth/administrador/login").permitAll()
                    .requestMatchers(HttpMethod.POST, "/auth/administrador/cadastro").permitAll()
                    .requestMatchers(HttpMethod.GET, "/auth/produto/listar").permitAll()
                    .requestMatchers(HttpMethod.GET, "/auth/produto/listarTodosAtivos/true").permitAll()
                    .requestMatchers( "/auth/produto/listarPorNome/{nome}").permitAll()
                    .requestMatchers(HttpMethod.GET,"/auth/produto/listarTodos").permitAll()
                    .requestMatchers("/auth/produto/{id}").permitAll()
                    .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/auth/produto/calcularFrete").permitAll()
                    .requestMatchers("/auth/usuario/cadastrarUsuario").permitAll()
                    .requestMatchers(HttpMethod.GET, "/auth/usuario/me").hasRole("USER")
                    .requestMatchers(HttpMethod.GET, "/auth/usuario/{usuarioId}").hasAnyRole("USER") 
                    .requestMatchers(HttpMethod.PUT, "/auth/usuario/atualizar/{id}").hasAnyRole("USER")
                    .requestMatchers(HttpMethod.POST, "/auth/usuario/{usuarioId}/enderecos").hasAnyRole("USER") 
                    .requestMatchers(HttpMethod.PUT, "/auth/usuario/{usuarioId}/enderecos/{enderecoId}/principal").hasAnyRole("USER") 
                    .requestMatchers("/auth/administrador/findAll/").hasAnyRole("ADMIN")
                    .requestMatchers("/auth/administrador/**").hasAnyRole("ADMIN")
                    .requestMatchers("/auth/produto/atualizar/{id}").hasAnyRole("ADMIN", "ESTOQUISTA")
                    .requestMatchers( "/auth/produto/listarTodosAtivos").hasAnyRole("ADMIN", "ESTOQUISTA")
                   .requestMatchers("/auth/produto/cadastrar").hasAnyRole("ADMIN")
                     .requestMatchers("/auth/produto/deletar/{id}").hasAnyRole("ADMIN", "ESTOQUISTA")
                     .requestMatchers("/auth/produto/{id}/status").hasAnyRole("ADMIN")
                    .requestMatchers("/auth/upload/**").permitAll()
                    .anyRequest().authenticated()
                )
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
    
    // --- 2. ADICIONE ESTE BEAN PARA CONFIGURAR O CORS DE FORMA CENTRALIZADA ---
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Define a origem permitida (seu frontend)
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        // Define os métodos HTTP permitidos
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Define os cabeçalhos permitidos (essencial para autenticação e JSON)
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Aplica esta configuração a todos os endpoints da sua API ("/**")
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // O restante dos seus beans (DaoAuthenticationProvider, AuthenticationManager, etc.) permanece igual.
    @Bean
    public DaoAuthenticationProvider usuarioAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(usuarioAuthService);
        provider.setPasswordEncoder(passwordEncoder());
        provider.setHideUserNotFoundExceptions(false);
        
        return provider;
    }

    @Bean
    public DaoAuthenticationProvider administradorAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(administradorAuthService);
        provider.setPasswordEncoder(passwordEncoder());
        provider.setHideUserNotFoundExceptions(false);
        return provider;
    }

     @Bean
     @Primary
    public AuthenticationManager userAuthenticationManager() {
        return new ProviderManager(usuarioAuthenticationProvider());
    }

    @Bean
    public AuthenticationManager adminAuthenticationManager() {
        return new ProviderManager(administradorAuthenticationProvider());
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}