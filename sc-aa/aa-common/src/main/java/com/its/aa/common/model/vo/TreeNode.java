package com.its.aa.common.model.vo;

/**
 * 
 * @author guzf
 * @date 2017年3月12日
 * @description 
 */

public class TreeNode extends BaseVO{
	private static final long serialVersionUID = 3944306216670905702L;
	private String id;  
    private String pId;
    private String name;  
    public boolean open = false;
    
    public String url;
    public String icon;
    public String title;
    
    public String type;
    public Object data;
    
    public TreeNode() {  
        super();  
    }
    
    public TreeNode(String id, String pId, String name) {  
        super();  
        this.id = id;  
        this.pId = pId;  
        this.name = name;  
    }
	
    public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getpId() {
		return pId;
	}

	public void setpId(String pId) {
		this.pId = pId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public boolean isOpen() {
		return open;
	}

	public void setOpen(boolean open) {
		this.open = open;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getIcon() {
		return icon;
	}

	public void setIcon(String icon) {
		this.icon = icon;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public Object getData() {
		return data;
	}

	public void setData(Object data) {
		this.data = data;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}
}
