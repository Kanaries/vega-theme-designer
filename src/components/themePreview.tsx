import React, {useRef, useEffect} from 'react';
import {themeConfigList} from '../utils/loadVegaResource';
import {DataBaseName, PreViewObjectStoreName} from '../config/dbConfig';
import ThemeIndexedDB from '../utils/useIndexedDB';

interface ThemePreviewProps {
	imageUrlKey: string
}

function ThemePreview(props: ThemePreviewProps) {
	const {imageUrlKey} = props;
	const style: React.CSSProperties = {
		maxWidth: '350px',
		minHeight: '600px',
	};
	const previewImg = useRef<HTMLImageElement | null>(null);

	async function updatePreviewImgFromIndexDB(themeName: string) {
		const themeDb = new ThemeIndexedDB(DataBaseName, 1);
		await themeDb.open();
		const result: Record<string, string> | undefined =
			await themeDb.getValue(PreViewObjectStoreName, themeName);
		themeDb.close();
		if (previewImg.current) {
			if (result) {
				previewImg.current.src = result.value;
			}
			if (!result && themeConfigList[themeName]) {
				previewImg.current.src = themeConfigList[themeName].preview;
			}
		}
	}

	useEffect(() => {
		updatePreviewImgFromIndexDB(imageUrlKey);
	});
	return (
		<div>
			<img src="" alt="" style={style} ref={previewImg} />
		</div>
	);
}

export default React.memo(ThemePreview);
