import React from 'react';
import {observer} from 'mobx-react-lite';
import {useUserStore} from '../store/userStore';

interface ThemePreviewProps {
	themeName: string;
}

const style: React.CSSProperties = {
	maxWidth: '350px',
	minHeight: '600px',
};

function ThemePreview(props: ThemePreviewProps) {
	const {themes} = useUserStore();
	const {themeName} = props;
	const theme = themes.find(thm => thm.name === themeName);

	return theme ? (
		<div>
			<img alt={theme.name} width="350" height="600" style={style} src={theme.previewSrc} />
		</div>
	) : null;
}

export default observer(ThemePreview);
