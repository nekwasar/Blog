package run.halo.app.security.admin;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Properties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.config.PlaceholderConfigurerSupport;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.io.ClassPathResource;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.security.util.InMemoryResource;
import org.springframework.stereotype.Service;
import org.springframework.util.PropertyPlaceholderHelper;
import org.springframework.util.StreamUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import reactor.util.retry.Retry;
import run.halo.app.extension.ConfigMap;
import run.halo.app.extension.ReactiveExtensionClient;
import run.halo.app.extension.Unstructured;
import run.halo.app.infra.ExternalUrlChangedEvent;
import run.halo.app.infra.SystemConfigFetcher;
import run.halo.app.infra.SystemSetting;
import run.halo.app.infra.SystemState;
import run.halo.app.infra.utils.JsonUtils;
import run.halo.app.infra.utils.YamlUnstructuredLoader;
import run.halo.app.plugin.PluginService;
import run.halo.app.security.SuperAdminInitializer;
import run.halo.app.theme.service.ThemeService;

@Slf4j
@Service
public class SetupInitializationService {

    static final PropertyPlaceholderHelper PROPERTY_PLACEHOLDER_HELPER = new PropertyPlaceholderHelper(
            PlaceholderConfigurerSupport.DEFAULT_PLACEHOLDER_PREFIX,
            PlaceholderConfigurerSupport.DEFAULT_PLACEHOLDER_SUFFIX);

    private final ReactiveExtensionClient client;

    private final SuperAdminInitializer superAdminInitializer;

    private final SystemConfigFetcher systemConfigFetcher;

    private final PluginService pluginService;

    private final ThemeService themeService;

    private final ApplicationEventPublisher eventPublisher;

    public SetupInitializationService(ReactiveExtensionClient client,
                                      SuperAdminInitializer superAdminInitializer,
                                      SystemConfigFetcher systemConfigFetcher,
                                      PluginService pluginService,
                                      ThemeService themeService,
                                      ApplicationEventPublisher eventPublisher) {
        this.client = client;
        this.superAdminInitializer = superAdminInitializer;
        this.systemConfigFetcher = systemConfigFetcher;
        this.pluginService = pluginService;
        this.themeService = themeService;
        this.eventPublisher = eventPublisher;
    }

    public Mono<Void> initialize(AdminSetupRequest request) {
        var superUserMono = superAdminInitializer
                .initialize(SuperAdminInitializer.InitializationParam.builder()
                        .username(request.getUsername())
                        .password(request.getPassword())
                        .email(request.getEmail())
                        .build())
                .subscribeOn(Schedulers.boundedElastic());

        var basicConfigMono = Mono.defer(
                        () -> systemConfigFetcher.getConfigMap().flatMap(configMap -> {
                            mergeToBasicConfig(request, configMap);
                            return client.update(configMap);
                        }))
                .retryWhen(Retry.backoff(5, Duration.ofMillis(100))
                        .filter(t -> t instanceof OptimisticLockingFailureException))
                .subscribeOn(Schedulers.boundedElastic())
                .then(Mono.fromCallable(() -> {
                    eventPublisher.publishEvent(new ExternalUrlChangedEvent(
                            this, URI.create(request.getExternalUrl()).toURL()));
                    return null;
                }));

        return Mono.when(
                        basicConfigMono,
                        superUserMono,
                        initializeNecessaryData(request.getUsername()),
                        pluginService.installPresetPlugins(),
                        themeService.installPresetTheme())
                .then(SystemState.upsetSystemState(client, state -> state.setIsSetup(true)))
                .doOnSuccess(v -> log.info("System initialization completed for user '{}'",
                        request.getUsername()))
                .doOnError(e -> log.error("System initialization failed", e));
    }

    private Mono<Void> initializeNecessaryData(String username) {
        return loadPresetExtensions(username)
                .concatMap(client::create)
                .subscribeOn(Schedulers.boundedElastic())
                .then();
    }

    Flux<Unstructured> loadPresetExtensions(String username) {
        return Mono.fromCallable(() -> {
                    var classPathResource = new ClassPathResource("initial-data.yaml");
                    String rawContent =
                            StreamUtils.copyToString(classPathResource.getInputStream(), StandardCharsets.UTF_8);
                    var properties = new Properties();
                    properties.setProperty("username", username);
                    properties.setProperty("timestamp", Instant.now().toString());
                    var processedContent =
                            PROPERTY_PLACEHOLDER_HELPER.replacePlaceholders(rawContent, properties);
                    var stringResource = new InMemoryResource(
                            processedContent.getBytes(StandardCharsets.UTF_8));
                    var loader = new YamlUnstructuredLoader(stringResource);
                    return loader.load();
                })
                .flatMapMany(Flux::fromIterable)
                .subscribeOn(Schedulers.boundedElastic());
    }

    private static void mergeToBasicConfig(AdminSetupRequest request, ConfigMap configMap) {
        Map<String, String> data = configMap.getData();
        if (data == null) {
            data = new LinkedHashMap<>();
            configMap.setData(data);
        }
        String basic = data.getOrDefault(SystemSetting.Basic.GROUP, "{}");
        var basicSetting = JsonUtils.jsonToObject(basic, SystemSetting.Basic.class);
        basicSetting.setTitle(request.getSiteTitle());
        basicSetting.setLanguage(request.getLanguage());
        basicSetting.setExternalUrl(request.getExternalUrl());
        data.put(SystemSetting.Basic.GROUP, JsonUtils.objectToJson(basicSetting));
    }
}
