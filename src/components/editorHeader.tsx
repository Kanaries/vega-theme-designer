/* eslint-disable no-tabs */
import React, {
	type FormEvent, useEffect, useState, ReactElement,
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
	DropdownMenuItemType,
	Persona,
	PersonaSize,
} from '@fluentui/react';
import {observer} from 'mobx-react-lite';
import {type Renderers} from 'vega';
import {useTranslation} from 'react-i18next';
import style from './editorHeader.module.css';
// import downloadJson from '../utils/download';
import ModalStyle from './modal.module.css';
import {getEditorValue} from './editorValue';
import ThemePreview from './themePreview';
import {themeConfigList} from '../utils/loadVegaResource';
import {
	addEventListen, emitEvent, removeEventListen,
} from '../utils/utils';
import {KanariesPath, useUserStore} from '../store/userStore';

type EditorHeader = {
	onRendererChange?: (val: Renderers) => void;
	renderer: Renderers;
	getPreviewFile: () => Promise<File | null>;
};

const defaultThemeList = Object.keys(themeConfigList);

const rendererOptions = [
	{key: 'canvas', text: 'canvas', selected: true},
	{key: 'svg', text: 'svg'},
];

const defaultThemeOptions = defaultThemeList.map<IDropdownOption>(item => {
	if (item === 'default') {
		return {key: item, text: item, selected: true};
	}

	return {key: item, text: item};
});

function editorHeader(props: EditorHeader): ReactElement {
	const {onRendererChange, renderer, getPreviewFile} = props;

	const [modalShow, setModalShow] = useState<boolean>(false);
	const [errMsg, setErrMsg] = useState<string>('');

	const [asName, setAsName] = useState<string>('');

	useEffect(() => {
		setAsName('');
	}, [modalShow]);

	const {t, i18n} = useTranslation();

	const userStore = useUserStore();
	const {
		user, loginStatus, themes, themeId, curTheme, allThemes,
	} = userStore;

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
		const eventIndex = addEventListen('switchRender2Canvas', () => {
			if (onRendererChange) {
				onRendererChange('canvas');
			}
		});
		return () => {
			removeEventListen('switchRender2Canvas', eventIndex);
		};
	}, []);

	// async function removeTheme(name: string): Promise<void> {
	// 	userStore.updateThemes();
	// 	const themeDb = new ThemeIndexedDB(DataBaseName, 1);
	// 	await themeDb.removeData(ThemeObjectStoreName, name);
	// 	await themeDb.removeData(PreViewObjectStoreName, name);
	// 	emitEvent('notification', {
	// 		msg: t('vegaDesigner.removeSuccess'),
	// 		type: MessageBarType.success,
	// 	});
	// }

	async function saveTheme(name: string, id?: string | undefined): Promise<void> {
		const config = getEditorValue();
		const cover = await getPreviewFile();
		if (!cover) {
			emitEvent('notification', {
				msg: 'Failed to generate preview',
				type: MessageBarType.error,
			});
			return;
		}
		await userStore.saveTheme(name, config, cover, id);
		setModalShow(false);
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
			const which = allThemes.find(thm => thm.id === opt.key);
			return (
				<TooltipHost
					content={<ThemePreview themeId={opt.key as string} />}
					id={elId}
					calloutProps={{gapSpace: 0}}
					styles={TooltipHostStyles}
					closeDelay={TooltipDelay.zero}
					delay={TooltipDelay.zero}
					directionalHint={DirectionalHint.rightBottomEdge}
				>
					<div className={style['dropdown-item']}>
						<div className={style['dropdown-option']} aria-describedby={elId}>
							{which ? <img alt="" className={style['dropdown-img']} src={which.previewSrc} /> : null}
							<span className={style['dropdown-text']}>{opt.text}</span>
						</div>
					</div>
				</TooltipHost>
			);
		}
		return null;
	};

	const isDefaultTheme = curTheme?.isDefault ?? false;

	const isLoggedIn = loginStatus === 'loggedIn';

	const customThemes = themes.map<IDropdownOption>(thm => ({key: thm.id, text: thm.name}));

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
						...customThemes,
						{key: 'divider', text: '-', itemType: DropdownMenuItemType.Divider},
						{key: 'group:default', text: t('vegaDesigner.defaultTheme'), itemType: DropdownMenuItemType.Header},
						...defaultThemeOptions,
					]}
					className={style.dropdown}
					onRenderOption={themeOptionRender}
					selectedKey={themeId}
					onChange={(e, opt) => {
						if (opt && opt.key !== themeId) {
							userStore.setTheme(opt.key as string);
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
					disabled={isDefaultTheme || !isLoggedIn || !curTheme?.id}
					onClick={() => curTheme && saveTheme(curTheme.name, curTheme.id)}
				>
					{t('vegaDesigner.saveTheme')}
				</DefaultButton>
				<DefaultButton
					className={style.button}
					disabled={!isLoggedIn}
					onClick={() => {
						setModalShow(true);
					}}
				>
					{t('vegaDesigner.saveAs.btn')}
				</DefaultButton>
				{/* <DefaultButton
					className={style['button-dangerous']}
					disabled={isDefaultTheme || !isLoggedIn}
					onClick={() => {
						removeTheme(themeName);
					}}
				>
					{t('vegaDesigner.deleteTheme')}
				</DefaultButton> */}
				<div className={style.lang}>
					<IconButton
						menuProps={langOption}
						iconProps={emojiIcon}
					/>
				</div>
				<div>
					{!isLoggedIn && (
						<DefaultButton
							disabled={loginStatus !== 'loggedOut'}
							onClick={() => {
								userStore.signUp();
							}}
						>
							{t('vegaDesigner.login')}
						</DefaultButton>
					)}
					{user && isLoggedIn ? (
						<a className={style.link} href={`${KanariesPath}/space/${user.userName}`} target="_blank" rel="noreferrer">
							<Persona
								text={user.userName}
								imageUrl={user.email}
								size={PersonaSize.size32}
							/>
						</a>
					) : null}
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
							value={asName}
							onChange={(e: FormEvent, val?: string) => {
								setErrMsg('');
								setAsName(val ?? '');
							}}
						/>
					</div>
					<div className={ModalStyle.footer}>
						<PrimaryButton
							className={style.button}
							disabled={!isLoggedIn || !asName}
							onClick={() => saveTheme(asName)}
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

export default observer(editorHeader);
