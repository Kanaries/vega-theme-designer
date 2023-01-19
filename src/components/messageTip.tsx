import React, {useEffect, useRef, useState} from 'react';
import {
	MessageBar,
	MessageBarType,
} from '@fluentui/react';
import style from './messageTip.module.css';
import {addEventListen, removeEventListen} from '../utils/utils';

interface ShowMessage {
	msg: string;
	type?: MessageBarType;
	delay?: number;
}

function messageTip() {
	const [isShowMessage, setIsShowMessage] = useState<boolean>(false);
	const messageBarType = useRef<MessageBarType>(MessageBarType.success);
	const message = useRef<string>('');
	function showMessage(opt: ShowMessage) {
		const {msg, type = MessageBarType.info, delay = 1000} = opt;
		messageBarType.current = type;
		message.current = msg;
		setIsShowMessage(true);
		setTimeout(() => {
			setIsShowMessage(false);
		}, delay);
	}
	useEffect(() => {
		const index = addEventListen('notification', showMessage);

		return () => {
			removeEventListen('notification', index);
		};
	}, []);
	return (
		<div className={style['message-bar']}>
			{
				isShowMessage ?
					(
						<MessageBar
							messageBarType={messageBarType.current}
							isMultiline={false}
						>
							{message.current}
						</MessageBar>
					) : null
			}
		</div>
	);
}

export default React.memo(messageTip);
