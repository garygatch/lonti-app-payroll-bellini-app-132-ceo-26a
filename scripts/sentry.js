Sentry.onLoad(async function () {
    let currentEnv = "local";

    // Get the Environment from Angular Injector
    try {
        const injector = angular.element(document.body).injector();
        if (injector && injector.has('$env')) {
            currentEnv = injector.get('$env').current.name;
        }
    } catch (e) {
        console.warn("Angular injector not ready yet, falling back to env: ", currentEnv);
    }

    Sentry.init({
        environment: currentEnv,
        integrations: [
            Sentry.browserTracingIntegration(),
        ],
        enableLogs: true,
        tracesSampleRate: 1.0,
        tracePropagationTargets: [
            "localhost:8080",
            "https://toro292.et.martiniserver.com",
            "https://toro287.et.martiniserver.com",
            /^\/api/
        ]
    });

    // Setup Meta Context
    try {
        const versionMeta = document.querySelector('meta[name=version]');
        if (versionMeta) {
            Sentry.setContext("app", { version: versionMeta.content });
        }
    } catch (e) {
        console.error("Failed to initialize Sentry context:", e);
    }

    // Setup User Context from Angular Injector
    try {
        const injector = angular.element(document.body).injector();
        if (injector && injector.has('$auth')) {
            const userInfo = await injector.get('$auth').getUserInfo();

            if (userInfo && userInfo.email) {
                Sentry.setUser({ email: userInfo.email });
            }
        }
    } catch (e) {
        console.warn("Could not set Sentry user on load. User may not be logged in.");
    }

    console.info(`Sentry Initialized in ${currentEnv} mode`);
});