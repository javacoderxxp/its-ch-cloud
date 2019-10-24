package com.its.sc.common.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.security.MessageDigest;

/**
 *
 * @Author xiaxp
 * @Date 2019/7/2 17:10
 * @Description
 */

public class MD5Util {

	//生成MD5  
    public static String getMD5(String message) {  
        String md5 = "";  
        try {  
            MessageDigest md = MessageDigest.getInstance("MD5");  // 创建一个md5算法对象  
            byte[] messageByte = message.getBytes("UTF-8");  
            byte[] md5Byte = md.digest(messageByte);              // 获得MD5字节数组,16*8=128位  
            md5 = bytesToHex(md5Byte);                            // 转换为16进制字符串  
        } catch (Exception e) {  
            e.printStackTrace();  
        }  
        return md5;  
    }  
   
     // 二进制转十六进制  
    public static String bytesToHex(byte[] bytes) {  
        StringBuffer hexStr = new StringBuffer();  
        int num;  
        for (int i = 0; i < bytes.length; i++) {  
            num = bytes[i];  
             if(num < 0) {  
                 num += 256;  
            }  
            if(num < 16){  
                hexStr.append("0");  
            }  
            hexStr.append(Integer.toHexString(num));  
        }  
        return hexStr.toString().toUpperCase();  
    }  
    
    public static String getMD5(File file){
    	String md5 = "";  
    	if(file.exists()){
    		FileInputStream fis = null;
        	try {
				MessageDigest md = MessageDigest.getInstance("MD5");  // 创建一个md5算法对象  
				fis = new FileInputStream(file);
				byte[] buffer = new byte[2048];
				int length = -1;
				while((length = fis.read(buffer)) != -1){
					md.update(buffer, 0, length);
				}
				byte[] md5Byte = md.digest(); 
				md5 = bytesToHex(md5Byte);
			} catch (Exception e) {
				e.printStackTrace();
			}finally{
				if(null != fis){
					try {
						fis.close();
					} catch (IOException e) {
						e.printStackTrace();
					}
				}
			}
    	}
    	return md5;
    }
}
