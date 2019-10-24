package com.its.aa.server.model.vo;

import com.its.aa.common.model.entity.AaMenu;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class Menu implements Serializable {
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

    private AaMenu parent;
}
