
FROM eclipse-temurin:17-jdk-jammy


WORKDIR /app


COPY pom.xml .
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn


RUN chmod +x ./mvnw


COPY src ./src


RUN ./mvnw clean package -DskipTests


RUN find target -name "*.jar" -not -name "*-sources.jar" -not -name "*-javadoc.jar" -exec cp {} app.jar \;


EXPOSE 8080


ENTRYPOINT ["java", "-jar", "app.jar"]