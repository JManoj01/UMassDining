# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

COPY . /app

RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY --from=build /app/target/umass-dining-api-1.0.0.jar /app/

EXPOSE 8080

CMD ["java", "-jar", "/app/umass-dining-api-1.0.0.jar"]
