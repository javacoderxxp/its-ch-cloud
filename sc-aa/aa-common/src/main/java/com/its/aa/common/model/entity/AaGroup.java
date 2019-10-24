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
 * 组织表
 * </p>
 *
 * @author guzf
 * @since 2019-08-08
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("t_aa_group")
public class AaGroup implements Serializable {

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
     * 组织编号
     */
    private String groupId;

    /**
     * 组织名称
     */
    private String groupName;

    /**
     * 父组织编号
     */
    private String parentId;

    /**
     * 辖区
     */
    private String shape;

    /**
     * 中队标记
     */
    private String zdFlag;

    /**
     * 父组织
     */
    @TableField(exist = false)
    private AaGroup parent;

    @TableField(exist = false)
    private List<AaUser> userList = new ArrayList<AaUser>();

}
