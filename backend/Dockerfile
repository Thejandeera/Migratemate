FROM eclipse-temurin:17-jre-alpine

# Add labels for better image management
LABEL maintainer="migratemate"
LABEL version="1.0"

WORKDIR /app

# Copy the JAR file (note: no leading slash on target)
COPY target/*.jar app.jar

# Expose the port
EXPOSE 8080

# Health check (optional - remove if causing issues)
# HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
#   CMD wget --quiet --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]