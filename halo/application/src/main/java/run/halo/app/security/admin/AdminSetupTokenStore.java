package run.halo.app.security.admin;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.PosixFilePermission;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import run.halo.app.infra.properties.HaloProperties;
import run.halo.app.infra.utils.JsonUtils;

@Slf4j
@Component
public class AdminSetupTokenStore {

    private static final String TOKEN_FILENAME = "admin-setup-token";

    private static final Duration TOKEN_TTL = Duration.ofMinutes(5);

    private final Path tokenFilePath;

    public AdminSetupTokenStore(HaloProperties haloProperties) {
        this.tokenFilePath = haloProperties.getWorkDir().resolve(TOKEN_FILENAME);
    }

    @PostConstruct
    public void init() {
        if (Files.exists(tokenFilePath)) {
            log.info("Admin setup token file exists at {}", tokenFilePath);
        }
    }

    public synchronized Mono<Void> validateAndConsume(String rawToken) {
        return readTokenFromFile()
                .flatMap(data -> {
                    if (data == null) {
                        return Mono.<Void>error(new ResponseStatusException(
                                HttpStatus.FORBIDDEN,
                                "No setup token found. Run halo-admin.sh generate on the server."));
                    }
                    if (data.consumed) {
                        return Mono.<Void>error(new ResponseStatusException(
                                HttpStatus.FORBIDDEN,
                                "Token already consumed. Admin was already created."));
                    }
                    if (Instant.now().isAfter(data.createdAt.plus(TOKEN_TTL))) {
                        return Mono.<Void>error(new ResponseStatusException(
                                HttpStatus.FORBIDDEN,
                                "Token expired. Generate a new one with halo-admin.sh generate."));
                    }
                    if (!MessageDigest.isEqual(
                            data.token.getBytes(StandardCharsets.UTF_8),
                            rawToken.getBytes(StandardCharsets.UTF_8))) {
                        return Mono.<Void>error(new ResponseStatusException(
                                HttpStatus.FORBIDDEN, "Invalid token."));
                    }
                    var consumed = new TokenData(data.token, data.createdAt, true);
                    return writeTokenToFile(consumed);
                })
                .switchIfEmpty(Mono.<Void>error(new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "No setup token found. Run halo-admin.sh generate on the server.")));
    }

    public synchronized Mono<Boolean> isActive() {
        return readTokenFromFile()
                .map(data -> data != null
                        && !data.consumed
                        && Instant.now().isBefore(data.createdAt.plus(TOKEN_TTL)))
                .defaultIfEmpty(false);
    }

    public synchronized Mono<Void> clear() {
        return Mono.<Void>fromRunnable(() -> {
            try {
                Files.deleteIfExists(tokenFilePath);
                log.info("Deleted admin setup token file");
            } catch (IOException e) {
                log.warn("Failed to delete admin setup token file", e);
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }

    private Mono<TokenData> readTokenFromFile() {
        return Mono.fromCallable(() -> {
            if (!Files.exists(tokenFilePath)) {
                return null;
            }
            var content = Files.readString(tokenFilePath);
            if (content.isBlank()) {
                return null;
            }
            var node = JsonUtils.mapper().readTree(content);
            return new TokenData(
                    node.get("token").asText(),
                    Instant.parse(node.get("createdAt").asText()),
                    node.get("consumed").asBoolean());
        }).subscribeOn(Schedulers.boundedElastic());
    }

    private Mono<Void> writeTokenToFile(TokenData data) {
        return Mono.<Void>fromRunnable(() -> {
            try {
                var json = JsonUtils.mapper().writeValueAsString(Map.of(
                        "token", data.token,
                        "createdAt", data.createdAt.toString(),
                        "consumed", data.consumed));
                Files.writeString(tokenFilePath, json);
                try {
                    Files.setPosixFilePermissions(tokenFilePath,
                            Set.of(PosixFilePermission.OWNER_READ, PosixFilePermission.OWNER_WRITE));
                } catch (Exception e) {
                    log.warn("Could not set permissions on token file (non-POSIX filesystem?)", e);
                }
                log.debug("Wrote admin setup token to {}", tokenFilePath);
            } catch (IOException e) {
                throw new UncheckedIOException("Failed to write token file", e);
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }

    private record TokenData(String token, Instant createdAt, boolean consumed) {}
}
