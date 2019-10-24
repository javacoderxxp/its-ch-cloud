package com.its.aa.common.model.entity;

import java.time.LocalDateTime;
import java.io.Serializable;
import java.util.List;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

/**
 * <p>
 * 用户表
 * </p>
 *
 * @author guzf
 * @since 2019-08-08
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("t_aa_user")
public class AaUser implements Serializable {

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
     * 用户编号
     */
    private String userId;

    /**
     * 姓名
     */
    private String userName;

    /**
     * 密码
     */
    private String password;

    /**
     * 组织编号
     */
    private String groupId;

    /**
     * 用户类型
     */
    private String type;

    /**
     * 性别
     */
    private String sex;

    /**
     * 警号
     */
    private String policeNo;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 电话
     */
    private String phoneNum;

    /**
     * 激活登录
     */
    private String active;

    /**
     * 上次登录时间
     */
    private LocalDateTime lastLoginDt;

    /**
     * 上次登录IP
     */
    private String lastLoginIp;

    @TableField(exist = false)
    private AaGroup group;

    @TableField(exist = false)
    private List<AaRole> roleList;


}
