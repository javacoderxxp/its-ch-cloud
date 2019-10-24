package com.its.sc.common.model.vo;

import java.util.HashMap;
import java.util.Map;

/**
 *
 * @Author xiaxp
 * @Date 2019/6/17 13:54
 * @Description
 */
public class WebResult extends HashMap<String, Object> {
	private static final long serialVersionUID = 1L;
	
	public static final int STATUS_OK = 200;
	public static final int STATUS_ERROR = 500;
	
	public WebResult() {
		put("code", STATUS_OK);
	}
	
	public static WebResult error() {
		return error(STATUS_ERROR, "未知异常，请联系管理员");
	}
	
	public static WebResult error(String msg) {
		return error(STATUS_ERROR, msg);
	}
	
	public static WebResult error(int code, String msg) {
		WebResult r = new WebResult();
		r.put("code", code);
		r.put("msg", msg);
		return r;
	}

	public static WebResult success(String msg) {
		WebResult r = new WebResult();
		r.put("msg", msg);
		return r;
	}
	
	public static WebResult success(Map<String, Object> map) {
		WebResult r = new WebResult();
		r.putAll(map);
		return r;
	}
	
	public static WebResult success() {
		return new WebResult();
	}

	@Override
	public WebResult put(String key, Object value) {
		super.put(key, value);
		return this;
	}
}