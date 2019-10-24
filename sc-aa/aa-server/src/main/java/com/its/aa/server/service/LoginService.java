package com.its.aa.server.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.its.aa.common.model.entity.AaRole;
import com.its.aa.common.model.entity.AaUser;
import com.its.aa.common.model.vo.UserVO;

import java.util.List;
import java.util.Map;

/**
 * <p>
 * 角色表 服务类
 * </p>
 *
 * @author guzf
 * @since 2019-08-08
 */
public interface LoginService extends IService<AaRole> {
   public boolean checkUsernameAndPwd(String username,String password);

   public String getToken(String username);

   public UserVO verifyToken(String token) throws Exception;
}
