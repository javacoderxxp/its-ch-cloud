package com.its.txlcnc.common.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDate;
import java.io.Serializable;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

/**
 * <p>
 * 测试表
 * </p>
 *
 * @author xiaxp
 * @since 2019-10-11
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("t_test_app")
public class TestApp implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 逻辑主键
     */
    private String id;

    private String name;

    private Integer age;

    private LocalDate startWorkDt;


}
