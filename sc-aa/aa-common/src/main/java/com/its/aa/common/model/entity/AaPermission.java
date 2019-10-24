package com.its.aa.common.model.entity;

import java.time.LocalDateTime;
import java.io.Serializable;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

/**
 * <p>
 * 权限表
 * </p>
 *
 * @author guzf
 * @since 2019-08-08
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("t_aa_permission")
public class AaPermission implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 逻辑主键
     */
    private String id;

    /**
     * 创建日期
     */
    private LocalDateTime createDt;

    /**
     * 创建者
     */
    private String createBy;

    /**
     * 更新日期
     */
    private LocalDateTime updateDt;

    /**
     * 更新者
     */
    private String updateBy;

    /**
     * 删除标记
     */
    private String delFlag="0";

    /**
     * 权限编号
     */
    private String permissionId;

    @TableField(exist = false)
    private String roleId;

    /**
     * 权限名称
     */
    private String permissionName;

    /**
     * 权限类型(MENU, FUNCTION, FILE)
     */
    private String type;

    /**
     * URL地址
     */
    private String url;

    /**
     * URL描述
     */
    private String urlDesc;

}
