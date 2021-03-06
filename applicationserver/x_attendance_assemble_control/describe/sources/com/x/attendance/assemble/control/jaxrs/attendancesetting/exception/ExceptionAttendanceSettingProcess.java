package com.x.attendance.assemble.control.jaxrs.attendancesetting.exception;

import com.x.base.core.project.exception.PromptException;

public class ExceptionAttendanceSettingProcess extends PromptException {

	private static final long serialVersionUID = 1859164370743532895L;

	public ExceptionAttendanceSettingProcess( Throwable e, String message ) {
		super("用户在进行系统配置信息处理时发生异常！message:" + message, e );
	}
}
