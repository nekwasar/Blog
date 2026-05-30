package run.halo.app.security.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import run.halo.app.infra.ValidationUtils;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminSetupRequest {

    @NotBlank
    @Size(min = 4, max = 63)
    @Pattern(regexp = ValidationUtils.NAME_REGEX, message = "{validation.error.username.pattern}")
    private String username;

    @NotBlank
    @Size(min = 5, max = 257)
    @Pattern(regexp = ValidationUtils.PASSWORD_REGEX, message = "{validation.error.password.pattern}")
    private String password;

    @NotBlank
    @Email
    private String email;

    @Builder.Default
    private String siteTitle = "My Blog";

    @Builder.Default
    private String language = "en";

    @Builder.Default
    private String externalUrl = "http://localhost:8090";
}
