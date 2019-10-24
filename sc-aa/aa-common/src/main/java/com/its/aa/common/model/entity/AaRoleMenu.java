package com.its.aa.common.model.entity;

import java.io.Serializable;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

/**
 * <p>
 * 角色菜单关系表
 * </p>
 *
 * @author guzf
 * @since 2019-08-08
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("t_aa_role_menu")
public class AaRoleMenu implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 逻辑主键
     */
    private String id;

    /**
     * 角色编号
     */
    private String roleId;

    /**
     * 菜单编号
     */
    private String menuId;


}
