package com.its.sc.common.util;

import com.baomidou.mybatisplus.generator.AutoGenerator;
import com.baomidou.mybatisplus.generator.config.DataSourceConfig;
import com.baomidou.mybatisplus.generator.config.GlobalConfig;
import com.baomidou.mybatisplus.generator.config.PackageConfig;
import com.baomidou.mybatisplus.generator.config.StrategyConfig;
import com.baomidou.mybatisplus.generator.config.rules.NamingStrategy;
import com.baomidou.mybatisplus.generator.engine.FreemarkerTemplateEngine;

/**
 * @Author xiaxp
 * @Date 2019/7/2 17:10
 * @Description
 */
public class CodeGenerater {
    public static void generate(String dbUrl, String driverName, String username, String password,String author,
                                String pkgName,String tablePrefix,String... tableNames){
        generate(dbUrl, driverName, username, password,
                false,author,
                pkgName,tablePrefix,tableNames);
    }

    private static void generate(String dbUrl, String driverName, String username, String password,
                                 boolean isForCommon, String author,
                                 String pkgName,String tablePrefix, String... tableNames){
        DataSourceConfig dataSourceConfig = new DataSourceConfig();
        dataSourceConfig.setUrl(dbUrl);
        dataSourceConfig.setDriverName(driverName);
        dataSourceConfig.setUsername(username);
        dataSourceConfig.setPassword(password);

        GlobalConfig globalConfig = new GlobalConfig();
        String path = System.getProperty("user.dir");
        globalConfig.setOutputDir(path + "/src/main/java");
        globalConfig.setServiceName("%sService")
                .setMapperName("%sRepo")
                .setOpen(false)
                .setActiveRecord(false)
                .setAuthor(author)
                .setEnableCache(false)
                .setBaseColumnList(true)
                .setBaseResultMap(true);
//        globalConfig.setSwagger2(true);

        StrategyConfig strategyConfig = new StrategyConfig();
        strategyConfig.setColumnNaming(NamingStrategy.underline_to_camel);
        strategyConfig.setEntityLombokModel(true);
        strategyConfig.setCapitalMode(true);
        strategyConfig.setNaming(NamingStrategy.underline_to_camel);
        strategyConfig.setInclude(tableNames);
        strategyConfig.setTablePrefix(tablePrefix);
//        strategyConfig.setEntityTableFieldAnnotationEnable(true);

        PackageConfig packageConfig = new PackageConfig();

        if(isForCommon){
            packageConfig.setEntity("model.entity");
            pkgName = pkgName + ".common";
        }else{
            packageConfig.setEntity("model.entity");
            packageConfig.setService("service");
            packageConfig.setServiceImpl("service.impl");
            packageConfig.setMapper("model.repo");
            packageConfig.setXml("model.repo.mapper");
            packageConfig.setController("web");
            pkgName = pkgName + ".server";
        }
        packageConfig.setParent(pkgName);


        AutoGenerator generator = new AutoGenerator();
        generator.setDataSource(dataSourceConfig);
        generator.setGlobalConfig(globalConfig);
        generator.setTemplateEngine(new FreemarkerTemplateEngine());
        generator.setStrategy(strategyConfig);
        generator.setPackageInfo(packageConfig);
        generator.execute();
    }
}
