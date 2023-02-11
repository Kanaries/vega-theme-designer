import React, {
	type FormEvent, useEffect, useState, useRef, ReactElement,
} from 'react';
import {
	Dropdown,
	PrimaryButton,
	Label,
	DefaultButton,
	Modal,
	TextField,
	TooltipHost,
	IconButton,
	type IDropdownOption,
	type IIconProps,
	type IContextualMenuProps,
	type IContextualMenuItem,
	type IRenderFunction,
	type ITooltipHostStyles,
	TooltipDelay,
	DirectionalHint,
	MessageBarType,
	FontIcon,
	DropdownMenuItemType,
} from '@fluentui/react';
import {type Renderers} from 'vega';
import {useTranslation} from 'react-i18next';
import style from './editorHeader.module.css';
// import downloadJson from '../utils/download';
import ThemeIndexedDB, {type IDBRequestEvent} from '../utils/useIndexedDB';
import ModalStyle from './modal.module.css';
import {getEditorValue} from './editorValue';
import ThemePreview from './themePreview';
import {themeConfigList} from '../utils/loadVegaResource';
import {
	addEventListen, emitEvent, removeAllEvent, removeEventListen,
} from '../utils/utils';
import {DataBaseName, ThemeObjectStoreName, PreViewObjectStoreName} from '../config/dbConfig';
import {useUserStore} from '../store/userStore';

type EditorHeader = {
	onThemeChange?: (val: string) => void;
	onRendererChange?: (val: Renderers) => void;
	renderer: Renderers
};

const defaultThemeList = Object.keys(themeConfigList);

const rendererOptions = [
	{key: 'canvas', text: 'canvas', selected: true},
	{key: 'svg', text: 'svg'},
];

async function getRestThemeList(callback: (restList: IDropdownOption[]) => void): Promise<void> {
	const callbackFun = function (event: IDBRequestEvent) {
		// 数据库创建或升级的时候会触发
		const db = event.target.result; // 数据库对象
		db.createObjectStore(ThemeObjectStoreName, {
			keyPath: 'themeName', // 这是主键
		});
		db.createObjectStore(PreViewObjectStoreName, {
			keyPath: 'themeName', // 这是主键
		});
	} as (e: Event) => void;
	const themeDb = new ThemeIndexedDB(DataBaseName, 1);
	await themeDb.open(callbackFun);
	const allTheme = await themeDb.getAll(ThemeObjectStoreName);
	const restTheme = allTheme.filter(item => !defaultThemeList.includes(item?.themeName));
	const restThemeList: IDropdownOption[] = restTheme.map(item => ({
		key: item?.themeName,
		text: item?.themeName,
	}));
	callback(restThemeList);
}

function savePreviewOnIndexDB(type: string, themeName: string, tip: string) {
	emitEvent('switchRender2Canvas');
	emitEvent('renderAllVega');
	addEventListen('storePreview', () => {
		emitEvent('vegaCharts2Image', {
			type,
			themeName,
		});
		removeAllEvent('storePreview');
		emitEvent('notification', {
			msg: tip,
			type: MessageBarType.success,
		});
	});
}

async function saveTheme(themeName: string, config: string, tip: string): Promise<void> {
	const themeDb = new ThemeIndexedDB(DataBaseName, 1);
	await themeDb.updateData(ThemeObjectStoreName, themeName, config);
	savePreviewOnIndexDB('update', themeName, tip);
}

async function savaAs(
	themeName: string,
	config: string,
	onSuccess: (res: string) => void,
	onErr: () => void,
): Promise<void> {
	const themeDb = new ThemeIndexedDB(DataBaseName, 1);
	await themeDb.open();
	themeDb.addValue(ThemeObjectStoreName, themeName, config)
		.then(onSuccess)
		.catch(onErr)
		.finally(() => {
			themeDb.close();
		});
}

const defaultThemeOptions = defaultThemeList.map<IDropdownOption>(item => {
	if (item === 'default') {
		return {key: item, text: item, selected: true};
	}

	return {key: item, text: item};
});

function editorHeader(props: EditorHeader): ReactElement {
	const {onThemeChange, onRendererChange, renderer} = props;

	const [themeOptions, setThemeOptions] = useState<IDropdownOption[]>([]);
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [errMsg, setErrMsg] = useState<string>('');

	const [theme, setTheme] = useState<string>('default');
	const newTheme = useRef<string>('');

	const {t, i18n} = useTranslation();

	const switchLang: (
		ev?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
		item?: IContextualMenuItem
	) => void = (e, opt): void => {
		if (opt) {
			i18n.changeLanguage(opt.key);
		}
	};

	const emojiIcon: IIconProps = {iconName: 'LocaleLanguage'};
	const langOption: IContextualMenuProps = {
		items: [
			{key: 'en', text: 'English', onClick: switchLang},
			{key: 'zh', text: '简体中文', onClick: switchLang},
		],
		directionalHintFixed: true,
	};

	useEffect(() => {
		getRestThemeList(
			(restList: IDropdownOption[]) => {
				setThemeOptions([...themeOptions, ...restList]);
			},
		);
		const eventIndex = addEventListen('switchRender2Canvas', () => {
			if (onRendererChange) {
				onRendererChange('canvas');
			}
		});
		return () => {
			removeEventListen('switchRender2Canvas', eventIndex);
		};
	}, []);

	function themeHasSame(): void {
		setErrMsg(t('vegaDesigner.saveAs.Modal.errorTip') as unknown as string);
	}

	function saveAsSuccess(themeName: string): void {
		setErrMsg('');
		setModalShow(false);
		setThemeOptions([...themeOptions, {key: themeName, text: themeName}]);
		setTheme(themeName);
		savePreviewOnIndexDB('add', themeName, t('vegaDesigner.saveSuccess'));
	}

	function saveAsBtnClick(): void {
		savaAs(newTheme.current, getEditorValue(), saveAsSuccess, themeHasSame);
	}

	async function removeTheme(themeName: string): Promise<void> {
		setTheme('default');
		setThemeOptions(themeOptions.filter(item => item.text !== themeName));
		const themeDb = new ThemeIndexedDB(DataBaseName, 1);
		await themeDb.removeData(ThemeObjectStoreName, themeName);
		await themeDb.removeData(PreViewObjectStoreName, themeName);
		emitEvent('notification', {
			msg: t('vegaDesigner.removeSuccess'),
			type: MessageBarType.success,
		});
	}

	const TooltipHostStyles: Partial<ITooltipHostStyles> =
	{
		root: {
			width: '100%',
			height: '100%',
			display: 'flex',
			'align-items': 'center',
		},
	};

	const themeOptionRender: IRenderFunction<IDropdownOption> =
	(opt, defaultRenderer): ReactElement | null => {
		if (opt) {
			const {itemType = DropdownMenuItemType.Normal} = opt;
			if (itemType !== DropdownMenuItemType.Normal) {
				return defaultRenderer?.(opt) ?? null;
			}
			const elId = `theme_renderer_item_${opt.text}`;
			return (
				<TooltipHost
					content={<ThemePreview imageUrlKey={opt.text} />}
					id={elId}
					calloutProps={{gapSpace: 0}}
					styles={TooltipHostStyles}
					closeDelay={0}
					delay={TooltipDelay.zero}
					directionalHint={DirectionalHint.rightBottomEdge}
				>
					<div className={style['dropdown-item']}>
						<div aria-describedby={elId}>
							<span>{opt.text}</span>
						</div>
						{
							defaultThemeList.includes(opt.text) ? null :
								(
									<div
										onClick={() => {
											removeTheme(opt.text);
										}}
										aria-hidden="true"
									>
										<FontIcon iconName="Cancel" />
									</div>
								)
						}
					</div>
				</TooltipHost>
			);
		}
		return null;
	};

	const isDefaultTheme = defaultThemeList.includes(theme);

	const {userName} = useUserStore();

	return (
		<div className={style['header-container']}>
			<div className={style['header-content']}>
				<Label className={style.label}>
					{t('vegaDesigner.theme')}
					:
				</Label>
				<Dropdown
					options={[
						{key: 'group:custom', text: t('vegaDesigner.customTheme'), itemType: DropdownMenuItemType.Header},
						...themeOptions,
						{key: 'divider', text: '-', itemType: DropdownMenuItemType.Divider},
						{key: 'group:default', text: t('vegaDesigner.defaultTheme'), itemType: DropdownMenuItemType.Header},
						...defaultThemeOptions,
					]}
					className={style.dropdown}
					onRenderOption={themeOptionRender}
					selectedKey={theme}
					onChange={(e, opt) => {
						if (opt && onThemeChange && opt.text !== theme) {
							if ([...themeOptions, ...defaultThemeOptions].some(thm => thm.text === opt.text)) {
								onThemeChange(opt.text);
								setTheme(opt.text);
							}
						}
					}}
				/>
				<Label className={style.label}>
					{t('vegaDesigner.renderer')}
					:
				</Label>
				<Dropdown
					options={rendererOptions}
					className={style.dropdown}
					selectedKey={renderer}
					onChange={(e, opt) => {
						if (opt && onRendererChange) {
							onRendererChange(opt.text as Renderers);
						}
					}}
				/>
				{/* <DefaultButton
					className={style.button}
					onClick={() => {
						downloadJson(getEditorValue(), theme);
					}}
				>
					{t('vegaDesigner.exportBtn')}
				</DefaultButton> */}
				<DefaultButton
					className={style.button}
					disabled={isDefaultTheme}
					onClick={() => {
						saveTheme(theme, getEditorValue(), t('vegaDesigner.saveSuccess'));
					}}
				>
					{t('vegaDesigner.saveTheme')}
				</DefaultButton>
				<DefaultButton
					className={style.button}
					onClick={() => {
						setModalShow(true);
					}}
				>
					{t('vegaDesigner.saveAs.btn')}
				</DefaultButton>
				<div className={style.lang}>
					<IconButton
						menuProps={langOption}
						iconProps={emojiIcon}
					/>
				</div>
				<div>
					{userName === null && (
						<DefaultButton
							className={style.button}
							onClick={() => {
								// TODO: 登录
							}}
						>
							{t('vegaDesigner.login')}
						</DefaultButton>
					)}
					{userName !== null && (
						<span>{userName}</span>
					)}
				</div>
				<Modal isOpen={modalShow} containerClassName={ModalStyle.container}>
					<div className={ModalStyle.header}>
						<Label className={ModalStyle['modal-title']}>
							{t('vegaDesigner.saveAs.Modal.title')}
							:
						</Label>
					</div>
					<div>
						<TextField
							label={t('vegaDesigner.saveAs.Modal.inputLabel') as unknown as string}
							errorMessage={errMsg}
							onChange={(e: FormEvent, val?: string) => {
								setErrMsg('');
								if (val !== undefined) {
									newTheme.current = val;
								}
							}}
						/>
					</div>
					<div className={ModalStyle.footer}>
						<PrimaryButton
							className={style.button}
							onClick={() => {
								saveAsBtnClick();
							}}
						>
							{t('vegaDesigner.saveAs.Modal.confirm')}
						</PrimaryButton>
						<DefaultButton
							className={style.button}
							onClick={() => {
								setModalShow(false);
							}}
						>
							{t('vegaDesigner.saveAs.Modal.cancel')}
						</DefaultButton>
					</div>
				</Modal>
			</div>
		</div>

	);
}

export default React.memo(editorHeader);
