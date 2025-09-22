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
                    // --- 1. ROTAS PÚBLICAS (Acesso sem token) ---
                    // Estas são as regras mais específicas para acesso público e são avaliadas primeiro.
                    .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                    .requestMatchers(HttpMethod.POST, "/auth/cadastro").permitAll()
                    .requestMatchers(HttpMethod.POST, "/auth/administrador/login").permitAll()
                    .requestMatchers(HttpMethod.POST, "/auth/administrador/cadastro").permitAll()
                    .requestMatchers(HttpMethod.GET, "/auth/produto/listar").permitAll()
                    .requestMatchers(HttpMethod.GET, "/auth/produto/listarTodosAtivos/true").permitAll()
                    .requestMatchers( "/auth/produto/listarPorNome/{nome}").permitAll()
                    .requestMatchers(HttpMethod.GET,"/auth/produto/listarTodos").permitAll()
                    
                    .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()

                    // --- 2. ROTAS DE ADMINISTRADOR (Acesso restrito) ---
                    // Qualquer outra requisição para estas rotas exigirá um dos cargos.
                    
                    .requestMatchers("/auth/administrador/findAll/").hasAnyRole("ADMIN")
                    .requestMatchers("/auth/administrador/**").hasAnyRole("ADMIN")
                    
                    .requestMatchers("/auth/produto/atualizar/{id}").hasAnyRole("ADMIN", "ESTOQUISTA")
                    .requestMatchers( "/auth/produto/listarTodosAtivos").hasAnyRole("ADMIN", "ESTOQUISTA")
                     
                   
                   .requestMatchers("/auth/produto/cadastrar").hasAnyRole("ADMIN")
                     .requestMatchers("/auth/produto/deletar/{id}").hasAnyRole("ADMIN", "ESTOQUISTA")
                     
                     .requestMatchers("/auth/produto/{id}/status").hasAnyRole("ADMIN")
                    
                    .requestMatchers("/auth/upload/**").permitAll()
                    
                    // --- 3. REGRA FINAL ---
                    // Qualquer outra rota não definida acima exige, no mínimo, um token válido.
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
        provider.setHideUserNotFoundExceptions(false);
        
        return provider;
    }

    // Cria um "provedor" que sabe como autenticar Administradores (consultando a tabela administradores)
    @Bean
    public DaoAuthenticationProvider administradorAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(administradorAuthService);
        provider.setPasswordEncoder(passwordEncoder());
        provider.setHideUserNotFoundExceptions(false);
        return provider;
    }

    // Cria o Gerente de Autenticação que usa os dois provedores acima
     @Bean
     @Primary
    public AuthenticationManager userAuthenticationManager() {
        return new ProviderManager(usuarioAuthenticationProvider());
    }

    /**
     * Cria um AuthenticationManager que usa SOMENTE o provedor de autenticação de administradores.
     * Damos a ele o nome de "adminAuthenticationManager".
     */
    @Bean
    public AuthenticationManager adminAuthenticationManager() {
        return new ProviderManager(administradorAuthenticationProvider());
    }

    // Define um bean único para o PasswordEncoder, que será usado em toda a aplicação
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}