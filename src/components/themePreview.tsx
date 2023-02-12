import React from 'react';
import {observer} from 'mobx-react-lite';
import {useUserStore} from '../store/userStore';

interface ThemePreviewProps {
	themeId: string;
}

const imgStyle: React.CSSProperties = {
	flexGrow: 0,
	flexShrink: 0,
	display: 'block',
	width: '100%',
	height: '100%',
	maxWidth: '30vw',
	maxHeight: '70vh',
};

function ThemePreview(props: ThemePreviewProps) {
	const {allThemes} = useUserStore();
	const {themeId} = props;
	const theme = allThemes.find(thm => thm.id === themeId);

	return theme ? (
		<div>
			<img alt="" style={imgStyle} src={theme.previewSrc} />
		</div>
	) : null;
}

export default observer(ThemePreview);
