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
                .cors(withDefaults()) 
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
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


                    .requestMatchers(HttpMethod.POST, "/auth/pedidos/carrinho").hasRole("USER")
                    .requestMatchers(HttpMethod.GET, "/auth/pedidos/meus-pedidos").hasRole("USER")
                    .requestMatchers(HttpMethod.PUT, "/auth/pedidos/*/endereco/*").hasRole("USER")
                    .requestMatchers(HttpMethod.PUT, "/auth/pedidos/*/finalizar").hasAnyRole("USER", "ADMIN", "ESTOQUISTA")
                    .requestMatchers(HttpMethod.PUT, "/auth/pedidos/*/status").hasAnyRole("ADMIN", "ESTOQUISTA")


                    .anyRequest().authenticated()
                )
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
    
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // ... (restante dos beans: passwordEncoder, managers, etc.) ...
    
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