package com.its.sc.common.config;

import com.google.common.base.Predicates;
import com.google.common.collect.FluentIterable;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.RequestHandler;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spi.service.RequestHandlerProvider;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

/**
 * @Author xiaxp
 * @Date 2019/10/23 17:19
 * @Description
 */
@EnableSwagger2
@Configuration
@ConditionalOnProperty(prefix = "swagger",value = {"enabled"},havingValue = "true")
public class SwaggerConfig {

    @Value("${spring.application.name}")
    private String app;

    @Bean
    public Docket docket() {
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo())
                .select()
                .apis(RequestHandlerSelectors.basePackage("com.its"))
                .paths(PathSelectors.any())
                .build();
    }

    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title((StringUtils.isEmpty(app)? "":app)+" 应用测试 Swagger")
                .contact(new Contact("ITS","",""))
                .version("1.0")
                .description("")
                .build();
    }
}
