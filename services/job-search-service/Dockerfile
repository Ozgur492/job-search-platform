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
COPY --from=build /build/target/job-search-service.jar /app/job-search-service.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "/app/job-search-service.jar"]
