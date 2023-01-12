import React, {type FormEvent, useEffect, useState} from 'react';
import {
	Dropdown,
	PrimaryButton,
	Label,
	DefaultButton,
	Modal,
	TextField,
	type IDropdownOption,
	IconButton,
	type IIconProps,
	type IContextualMenuProps,
	type IContextualMenuItem,
} from '@fluentui/react';
import {type Renderers} from 'vega';
import {useTranslation} from 'react-i18next';
import style from './editorHeader.module.css';
import downloadJson from '../utils/download';
import ThemeIndexedDB, {type IDBRequestEvent} from '../utils/useIndexedDB';
import ModalStyle from './modal.module.css';

type EditorHeader = {
	onThemeChange?: (val: string) => void;
	onRendererChange?: (val: Renderers) => void;
	editorVal: string;
};

const defaultThemeList = ['default', 'excel', 'dark', 'ggplot2', 'quartz', 'vox', 'fivethirtyeight', 'latimes', 'urbaninstitute', 'googlecharts', 'powerbi'];

const rendererOptions = [
	{key: 'canvas', text: 'canvas'},
	{key: 'svg', text: 'svg', selected: true},
];

const DataBaseName = 'vega_theme_designer';
const ObjectStoreName = 'ThemeTable';

async function getRestThemeList(callback: (restList: IDropdownOption[]) => void): Promise<void> {
	const callbackFun = function (event: IDBRequestEvent) {
		// 数据库创建或升级的时候会触发
		const db = event.target.result; // 数据库对象
		db.createObjectStore(ObjectStoreName, {
			keyPath: 'themeName', // 这是主键
		});
	} as (e: Event) => void;
	const themeDb = new ThemeIndexedDB(DataBaseName, 1);
	await themeDb.open(callbackFun);
	const allTheme = await themeDb.getAll(ObjectStoreName);
	const restTheme = allTheme.filter((item) => !defaultThemeList.includes(item?.themeName));
	const restThemeList: IDropdownOption[] = restTheme.map((item) => ({
		key: item?.themeName,
		text: item?.themeName,
	}));
	callback(restThemeList);
}

async function saveTheme(themeName: string, config: string): Promise<void> {
	const themeDb = new ThemeIndexedDB(DataBaseName, 1);
	await themeDb.open();
	await themeDb.putValue(ObjectStoreName, themeName, config);
	themeDb.close();
}

async function savaAs(
	themeName: string,
	config: string,
	onSuccess: (res: string) => void,
	onErr: () => void,
): Promise<void> {
	const themeDb = new ThemeIndexedDB(DataBaseName, 1);
	await themeDb.open();
	themeDb.addValue(ObjectStoreName, themeName, config)
		.then(onSuccess, onErr)
		.finally(() => {
			themeDb.close();
		});
}

function editorHeader(props: EditorHeader): JSX.Element {
	console.log('header');
	const {onThemeChange, onRendererChange, editorVal} = props;

	const [themeOptions, setThemeOptions] = useState<IDropdownOption[]>([
		...defaultThemeList.map((item) => {
			if (item === 'default') {
				return {key: item, text: item, selected: true};
			}

			return {key: item, text: item};
		}),
	]);
	const [modalShow, setModalShow] = useState<boolean>(false);
	const [theme, setTheme] = useState<string>('default');
	const [newTheme, setNewTheme] = useState<string>('');
	const [errMsg, setErrMsg] = useState<string>('');

	const {t, i18n} = useTranslation();

	const switchLang: (
		ev?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
		item?: IContextualMenuItem
	) => void = (e, opt): void => {
		if (opt) {
			void i18n.changeLanguage(opt.key);
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
		void getRestThemeList(
			(restList: IDropdownOption[]) => {
				setThemeOptions([...themeOptions, ...restList]);
			},
		);
	}, []);

	function themeHasSame(): void {
		setErrMsg(t('vegaDesigner.saveAs.Modal.errorTip') as unknown as string);
	}

	function saveAsSuccess(themeName: string): void {
		setErrMsg('');
		setModalShow(false);
		setThemeOptions([...themeOptions, {key: themeName, text: themeName}]);
	}

	function saveAsBtnClick(): void {
		void savaAs(newTheme, editorVal, saveAsSuccess, themeHasSame);
	}

	return (
		<div className={style['header-container']}>
			<Label className={style.label}>
				{t('vegaDesigner.theme')}
				:
			</Label>
			<Dropdown
				options={themeOptions}
				className={style.dropdown}
				onChange={(e, opt) => {
					if (opt && onThemeChange) {
						onThemeChange(opt.text);
						setTheme(opt.text);
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
				onChange={(e, opt) => {
					if (opt && onRendererChange) {
						onRendererChange(opt.text as Renderers);
					}
				}}
			/>
			<DefaultButton
				className={style.button}
				onClick={() => {
					downloadJson(editorVal, theme);
				}}
			>
				{t('vegaDesigner.exportBtn')}
			</DefaultButton>
			<DefaultButton
				className={style.button}
				onClick={() => {
					void saveTheme(theme, editorVal);
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
								setNewTheme(val);
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
	);
}

export default React.memo(editorHeader);
