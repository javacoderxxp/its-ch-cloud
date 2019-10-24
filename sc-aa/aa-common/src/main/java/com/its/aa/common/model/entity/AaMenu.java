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
 * 菜单表
 * </p>
 *
 * @author guzf
 * @since 2019-08-08
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("t_aa_menu")
public class AaMenu implements Serializable {

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
    private String delFlag;

    /**
     * 菜单编号
     */
    private String menuId;

    /**
     * 菜单名称
     */
    private String menuName;

    /**
     * 父菜单编号
     */
    private String parentId;

    /**
     * 类型
     */
    private String type;

    /**
     * 超链接URL
     */
    private String href;

    /**
     * 菜单图标
     */
    private String icon;

    /**
     * 排序
     */
    private String sort;

    /**
     * 生效
     */
    private String active;

    @TableField(exist = false)
    private AaMenu parent;

    /**
     * 父菜单编号,用于显示ztree树形结构
     */
    @TableField(exist = false)
    private String pId;
}
