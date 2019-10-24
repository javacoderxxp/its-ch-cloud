package com.its.aa.common.model.entity;

import java.time.LocalDateTime;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

/**
 * <p>
 * 角色表
 * </p>
 *
 * @author guzf
 * @since 2019-08-08
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("t_aa_role")
public class AaRole implements Serializable {

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
    private String delFlag = "0";

    /**
     * 角色编号
     */
    private String roleId;

    /**
     * 角色名称
     */
    private String roleName;

    @TableField(exist = false)
    private List<AaPermission> permissionList = new ArrayList<AaPermission>();

    @TableField(exist = false)
    private List<AaMenu> menuList = new ArrayList<AaMenu>();

}
