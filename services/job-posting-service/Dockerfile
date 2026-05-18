# Stage 1: Build
FROM eclipse-temurin:21-jdk AS build
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN apt-get update && apt-get install -y maven && \
    mvn clean package -DskipTests

# Stage 2: Runtime
FROM gcr.io/distroless/java21-debian12:nonroot
WORKDIR /app
COPY --from=build /build/target/job-posting-service.jar /app/job-posting-service.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app/job-posting-service.jar"]
