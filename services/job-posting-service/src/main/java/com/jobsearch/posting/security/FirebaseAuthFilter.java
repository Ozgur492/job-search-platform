package com.jobsearch.posting.security;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.jobsearch.posting.entity.AppUser;
import com.jobsearch.posting.entity.enums.Role;
import com.jobsearch.posting.repository.AppUserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class FirebaseAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(FirebaseAuthFilter.class);
    private final AppUserRepository appUserRepository;

    public FirebaseAuthFilter(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (FirebaseApp.getApps().isEmpty()) {
            log.warn("Firebase not initialized, skipping auth filter");
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
            String uid = decodedToken.getUid();
            String email = decodedToken.getEmail();
            String name = decodedToken.getName();

            // Upsert user
            AppUser user = appUserRepository.findByFirebaseUid(uid).orElseGet(() -> {
                AppUser newUser = new AppUser();
                newUser.setFirebaseUid(uid);
                newUser.setEmail(email != null ? email : "");
                newUser.setDisplayName(name);
                newUser.setRole(Role.USER);
                return appUserRepository.save(newUser);
            });

            request.setAttribute("currentUser", user);

            List<SimpleGrantedAuthority> authorities = List.of(
                    new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
            );

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(user, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (Exception e) {
            log.error("Firebase token verification failed", e);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":{\"code\":\"UNAUTHORIZED\",\"message\":\"Invalid or expired token\"}}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
