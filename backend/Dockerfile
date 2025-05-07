FROM gradle:8.10.2-jdk17 AS builder
WORKDIR /app
COPY build.gradle.kts settings.gradle.kts ./
COPY src ./src
RUN gradle build --no-daemon

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
COPY config/application-docker.yaml ./config/application.yaml
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
